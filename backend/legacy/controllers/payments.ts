import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { lockEscrow, releaseEscrow } from "../services/escrow";
import { createUpiMandate, releaseFundsToHost, refundToCohost, verifyWebhookSignature } from "../services/razorpay";
import { broadcastEscrowUpdate } from "../services/websocket";

// ---------------------------------------------------------------------------
// POST /api/payments/mandate — Mock UPI AutoPay mandate creation
// ---------------------------------------------------------------------------
export const createMandate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slotId, amount, upiId } = req.body;
    if (!slotId || !amount) throw new AppError("slotId and amount are required", 400);

    // Fetch user info for Razorpay customer creation
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true, email: true, phone: true },
    });
    if (!user) throw new AppError("User not found", 404);

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { plan: { select: { billingCycle: true, service: true } } },
    });
    if (!slot) throw new AppError("Slot not found", 404);

    const result = await createUpiMandate({
      slotId,
      userId: req.user!.id,
      amount: Number(amount),
      email: user.email,
      phone: user.phone || undefined,
      name: user.name,
      billingCycle: slot.plan.billingCycle,
    });

    // Notify user via WebSocket
    broadcastEscrowUpdate(req.user!.id, slotId, "LOCKED", Number(amount));

    res.status(201).json({
      success: true,
      message: "UPI AutoPay mandate created. Funds locked in escrow.",
      data: {
        mandateId: result.mandateId,
        status: result.status,
        activationUrl: result.shortUrl || null,
        upiId: upiId || "upi@splitza",
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/release/:slotId — Host: manually request payout release
// ---------------------------------------------------------------------------
export const requestRelease = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = req.params.slotId as string;

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { plan: { include: { host: { select: { id: true, name: true } } } }, trustVotes: true },
    });

    if (!slot) throw new AppError("Slot not found", 404);
    if (slot.plan.hostId !== req.user!.id) throw new AppError("Not authorized", 403);
    if (!slot.escrowLocked) throw new AppError("No escrowed funds to release", 400);

    // Check trust threshold
    const trustVotes = slot.trustVotes.filter((v) => v.vote === "TRUST").length;
    const totalVoters = slot.coHostId ? 1 : 0;
    const trustRatio = totalVoters > 0 ? trustVotes / totalVoters : 0;

    if (trustRatio < 0.6 && req.user!.role !== "ADMIN") {
      throw new AppError(
        `Insufficient trust votes (${Math.round(trustRatio * 100)}% trust, need 60%). ` +
          "Wait for co-hosts to vote or request weekly payout.",
        400
      );
    }

    // Use Razorpay Route to transfer to host's UPI
    const hostUpiId = (slot.plan.host as any).upiId || process.env.DEFAULT_HOST_UPI || "host@upi";
    const amount = Number(slot.escrowAmount || 0);

    const payoutResult = await releaseFundsToHost({
      slotId,
      hostUpiId,
      amount,
    });

    // Notify host via WebSocket
    broadcastEscrowUpdate(slot.plan.hostId, slotId, "RELEASED", amount);

    res.json({
      success: true,
      message: "Payout released! Funds transferred via UPI.",
      data: { payoutId: payoutResult.payoutId, amount: payoutResult.amount, utr: payoutResult.utr },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/payments/history — User: get own payment history
// ---------------------------------------------------------------------------
export const getPaymentHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: req.user!.id },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
        include: {
          slot: {
            include: { plan: { select: { service: true, tier: true } } },
          },
        },
      }),
      prisma.payment.count({ where: { userId: req.user!.id } }),
    ]);

    const totalPaid = payments
      .filter((p) => p.status === "ESCROWED" || p.status === "RELEASED")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    res.json({
      success: true,
      data: {
        payments,
        totalPaid,
        pagination: { page: parseInt(page as string), total },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/payments/host-earnings — Host: get earnings summary
// ---------------------------------------------------------------------------
export const getHostEarnings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hostPlans = await prisma.plan.findMany({
      where: { hostId: req.user!.id },
      select: { id: true },
    });

    const planIds = hostPlans.map((p) => p.id);
    const slotIds = (
      await prisma.slot.findMany({
        where: { planId: { in: planIds } },
        select: { id: true },
      })
    ).map((s) => s.id);

    const payments = await prisma.payment.findMany({
      where: { slotId: { in: slotIds }, status: { in: ["RELEASED", "ESCROWED"] } },
      include: { slot: { include: { plan: { select: { service: true } } } } },
    });

    const totalEarned = payments
      .filter((p) => p.status === "RELEASED")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pending = payments
      .filter((p) => p.status === "ESCROWED")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const platformFee = totalEarned * 0.05;
    const netEarned = totalEarned - platformFee;

    res.json({
      success: true,
      data: { totalEarned, pending, platformFee, netEarned, payments },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/webhook — Mock Razorpay webhook handler
// ---------------------------------------------------------------------------
export const handleWebhook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verify Razorpay webhook signature
    const signature = req.headers["x-razorpay-signature"] as string;
    const rawBody = JSON.stringify(req.body);

    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      res.status(400).json({ success: false, message: "Invalid webhook signature" });
      return;
    }

    const { event, payload } = req.body;
    console.log(`🔔 [WEBHOOK] Event: ${event}`);

    switch (event) {
      case "payment.captured": {
        const paymentEntity = payload?.payment?.entity;
        if (paymentEntity?.id) {
          await prisma.payment.updateMany({
            where: { razorpayId: paymentEntity.id },
            data: { status: "ESCROWED" },
          });
          // Notify co-host
          const payment = await prisma.payment.findFirst({ where: { razorpayId: paymentEntity.id } });
          if (payment) broadcastEscrowUpdate(payment.userId, payment.slotId, "LOCKED", Number(payment.amount));
        }
        break;
      }

      case "subscription.activated": {
        const subId = payload?.subscription?.entity?.id;
        if (subId) {
          const payment = await prisma.payment.findFirst({ where: { razorpayId: subId } });
          if (payment) {
            await prisma.payment.update({ where: { id: payment.id }, data: { status: "ESCROWED" } });
            await prisma.slot.update({ where: { id: payment.slotId }, data: { escrowLocked: true, escrowAmount: payment.amount, status: "ACTIVE" } });
          }
        }
        console.log("[WEBHOOK] UPI AutoPay mandate activated");
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload?.payment?.entity;
        if (paymentEntity?.id) {
          await prisma.payment.updateMany({
            where: { razorpayId: paymentEntity.id },
            data: { status: "FAILED" },
          });
        }
        break;
      }

      case "subscription.charged": {
        // Recurring billing cycle processed
        console.log("[WEBHOOK] Recurring subscription charge processed");
        break;
      }

      case "payout.processed": {
        const payoutId = payload?.payout?.entity?.id;
        console.log(`[WEBHOOK] Payout processed: ${payoutId}`);
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event: ${event}`);
    }

    res.json({ success: true, received: true });
  } catch (err) {
    next(err);
  }
};
