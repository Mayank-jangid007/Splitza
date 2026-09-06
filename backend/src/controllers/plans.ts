import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { queueBotVerification } from "../services/bot";

// ---------------------------------------------------------------------------
// GET /api/plans — Public: list active plans with filters
// ---------------------------------------------------------------------------
export const listPlans = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { service, minPrice, maxPrice, category, page = "1", limit = "12" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, any> = {
      status: "ACTIVE",
      filledSlots: { lt: prisma.plan.fields.totalSlots }, // has open slots
    };
    if (service) where.service = { contains: service as string, mode: "insensitive" };
    if (minPrice) where.pricePerSlot = { gte: Number(minPrice) };
    if (maxPrice) {
      where.pricePerSlot = { ...(where.pricePerSlot || {}), lte: Number(maxPrice) };
    }

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          host: {
            select: { id: true, name: true, avatarUrl: true, trustScore: true },
          },
          _count: { select: { slots: true } },
        },
      }),
      prisma.plan.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        plans,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/plans/:id — Public: single plan detail
// ---------------------------------------------------------------------------
export const getPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = req.params.id as string;
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        host: { select: { id: true, name: true, avatarUrl: true, trustScore: true } },
        slots: {
          select: {
            id: true, status: true, escrowLocked: true,
            coHost: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });
    if (!plan) throw new AppError("Plan not found", 404);
    res.json({ success: true, data: { plan } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/plans — Host: create a new plan
// ---------------------------------------------------------------------------
export const createPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { service, tier, description, totalSlots, pricePerSlot, billingCycle } = req.body;

    if (!service || !tier || !totalSlots || !pricePerSlot) {
      throw new AppError("service, tier, totalSlots and pricePerSlot are required", 400);
    }
    if (totalSlots < 2 || totalSlots > 10) throw new AppError("totalSlots must be 2–10", 400);
    if (pricePerSlot < 10) throw new AppError("Minimum price per slot is ₹10", 400);

    const plan = await prisma.plan.create({
      data: {
        service,
        tier,
        description: description || null,
        totalSlots: parseInt(totalSlots),
        pricePerSlot,
        billingCycle: billingCycle || "monthly",
        hostId: req.user!.id,
        status: "PENDING_VERIFICATION",
        // Create empty slots
        slots: {
          create: Array.from({ length: parseInt(totalSlots) }, () => ({
            status: "OPEN" as const,
          })),
        },
      },
      include: {
        slots: { select: { id: true, status: true } },
        host: { select: { id: true, name: true } },
      },
    });

    // Queue real Puppeteer bot verification
    // Credentials are passed by host during plan creation
    const { hostEmail, hostPassword } = req.body;
    if (hostEmail && hostPassword) {
      queueBotVerification(plan.id, service, { email: hostEmail, password: hostPassword });
    } else {
      console.log(`⚠️  [PLANS] No host credentials provided — skipping bot verification for plan ${plan.id}`);
    }

    res.status(201).json({
      success: true,
      message: "Plan created. Bot verification initiated.",
      data: { plan },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/plans/:id — Host: update plan details
// ---------------------------------------------------------------------------
export const updatePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = req.params.id as string;
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError("Plan not found", 404);
    if (plan.hostId !== req.user!.id) throw new AppError("Not authorized", 403);
    if (plan.status === "CLOSED") throw new AppError("Cannot update a closed plan", 400);

    const { description, billingCycle } = req.body;

    const updated = await prisma.plan.update({
      where: { id: planId },
      data: {
        ...(description !== undefined && { description }),
        ...(billingCycle && { billingCycle }),
      },
    });

    res.json({ success: true, message: "Plan updated", data: { plan: updated } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/plans/:id — Host: close a plan
// ---------------------------------------------------------------------------
export const closePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = req.params.id as string;
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError("Plan not found", 404);
    if (plan.hostId !== req.user!.id) throw new AppError("Not authorized", 403);

    await prisma.plan.update({
      where: { id: planId },
      data: { status: "CLOSED" },
    });

    res.json({ success: true, message: "Plan closed successfully" });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/plans/my — Host: get own plans
// ---------------------------------------------------------------------------
export const getMyPlans = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const plans = await prisma.plan.findMany({
      where: { hostId: req.user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        slots: {
          include: {
            coHost: { select: { id: true, name: true, avatarUrl: true, trustScore: true } },
            payments: { where: { status: "ESCROWED" }, select: { amount: true } },
            trustVotes: { select: { vote: true, voter: { select: { id: true, name: true } } } },
          },
        },
        _count: { select: { slots: true } },
      },
    });

    // Compute stats per plan
    const plansWithStats = plans.map((plan) => {
      const activeSlots = plan.slots.filter((s) => s.status === "ACTIVE" || s.coHostId).length;
      const monthlyEarnings = plan.slots
        .filter((s) => s.payments.some((p) => Number(p.amount) > 0))
        .length * Number(plan.pricePerSlot);

      return { ...plan, activeSlots, monthlyEarnings };
    });

    res.json({ success: true, data: { plans: plansWithStats } });
  } catch (err) {
    next(err);
  }
};
