import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { lockEscrow, releaseEscrow } from "../services/escrow";

// ---------------------------------------------------------------------------
// POST /api/slots/:slotId/join — Co-host: join a slot
// ---------------------------------------------------------------------------
export const joinSlot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = req.params.slotId as string;
    const userId = req.user!.id;

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { plan: true },
    });

    if (!slot) throw new AppError("Slot not found", 404);
    if (slot.status !== "OPEN") throw new AppError("This slot is no longer available", 400);
    if (slot.plan.hostId === userId) throw new AppError("Hosts cannot join their own plans", 400);

    // Check user hasn't already joined this plan
    const existingSlot = await prisma.slot.findFirst({
      where: { planId: slot.planId, coHostId: userId },
    });
    if (existingSlot) throw new AppError("You have already joined this plan", 400);

    // Lock the slot
    const updatedSlot = await prisma.slot.update({
      where: { id: slotId },
      data: { coHostId: userId, status: "LOCKED" },
    });

    // Update plan filled slot count
    await prisma.plan.update({
      where: { id: slot.planId },
      data: { filledSlots: { increment: 1 } },
    });

    // Lock escrow (mock UPI AutoPay mandate)
    const payment = await lockEscrow(
      slotId,
      userId,
      Number(slot.plan.pricePerSlot),
      `UPI-MOCK-${Date.now()}`
    );

    // Notify host
    await prisma.notification.create({
      data: {
        userId: slot.plan.hostId,
        type: "PAYMENT_RECEIVED",
        title: "New Co-host Joined!",
        body: `Someone joined your ${slot.plan.service} plan. Funds are locked in escrow.`,
        metadata: { slotId, planId: slot.planId },
      },
    });

    res.status(201).json({
      success: true,
      message: "Slot joined! Your payment is locked in escrow.",
      data: { slot: updatedSlot, payment },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/slots/my — Co-host: get own joined slots
// ---------------------------------------------------------------------------
export const getMySlots = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slots = await prisma.slot.findMany({
      where: { coHostId: req.user!.id, status: { not: "CLOSED" } },
      include: {
        plan: {
          include: {
            host: { select: { id: true, name: true, avatarUrl: true, trustScore: true } },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, amount: true, createdAt: true },
        },
        trustVotes: {
          where: { voterId: req.user!.id },
          select: { vote: true, createdAt: true },
        },
      },
    });

    res.json({ success: true, data: { slots } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/slots/:slotId — Get single slot details
// ---------------------------------------------------------------------------
export const getSlot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = req.params.slotId as string;
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        plan: { include: { host: { select: { id: true, name: true, avatarUrl: true } } } },
        coHost: { select: { id: true, name: true, avatarUrl: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 5 },
        trustVotes: {
          include: { voter: { select: { id: true, name: true } } },
        },
      },
    });

    if (!slot) throw new AppError("Slot not found", 404);
    res.json({ success: true, data: { slot } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/slots/:slotId/leave — Co-host: leave a slot (before escrow release)
// ---------------------------------------------------------------------------
export const leaveSlot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = req.params.slotId as string;
    const slot = await prisma.slot.findUnique({ where: { id: slotId }, include: { plan: true } });

    if (!slot) throw new AppError("Slot not found", 404);
    if (slot.coHostId !== req.user!.id) throw new AppError("Not authorized", 403);
    if (slot.status === "ACTIVE") {
      throw new AppError(
        "Cannot leave an active slot mid-cycle. Please wait for the billing period to end.",
        400
      );
    }

    await prisma.$transaction([
      prisma.slot.update({
        where: { id: slotId },
        data: { coHostId: null, status: "OPEN", escrowLocked: false, escrowAmount: null },
      }),
      prisma.payment.updateMany({
        where: { slotId: slotId, userId: req.user!.id, status: "ESCROWED" },
        data: { status: "REFUNDED" },
      }),
      prisma.plan.update({
        where: { id: slot.planId },
        data: { filledSlots: { decrement: 1 } },
      }),
    ]);

    res.json({ success: true, message: "You have left the slot. Escrow will be refunded." });
  } catch (err) {
    next(err);
  }
};
