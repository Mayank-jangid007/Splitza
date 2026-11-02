import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

// ---------------------------------------------------------------------------
// GET /api/admin/stats — Platform overview stats
// ---------------------------------------------------------------------------
export const getStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalUsers, totalPlans, totalSlots, totalPayments] = await Promise.all([
      prisma.user.count(),
      prisma.plan.count({ where: { status: "ACTIVE" } }),
      prisma.slot.count({ where: { status: "ACTIVE" } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "RELEASED" },
      }),
    ]);

    const totalEscrowed = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "ESCROWED" },
    });

    const userGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: true,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activePlans: totalPlans,
        activeSlots: totalSlots,
        totalReleased: Number(totalPayments._sum.amount || 0),
        totalEscrowed: Number(totalEscrowed._sum.amount || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/users — List all users with pagination
// ---------------------------------------------------------------------------
export const listUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "20", role, search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: Record<string, any> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, trustScore: true, createdAt: true,
          _count: { select: { hostedPlans: true, joinedSlots: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { page: parseInt(page as string), total } },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/disputes — List disputed slots
// ---------------------------------------------------------------------------
export const listDisputes = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const disputedSlots = await prisma.slot.findMany({
      where: { status: "DISPUTED" },
      include: {
        plan: { include: { host: { select: { id: true, name: true, email: true } } } },
        coHost: { select: { id: true, name: true, email: true } },
        trustVotes: { include: { voter: { select: { id: true, name: true } } } },
        payments: { where: { status: "ESCROWED" } },
      },
    });

    // Also check slots with majority DISPUTE votes
    const slotsWithDisputeVotes = await prisma.slot.findMany({
      where: { trustVotes: { some: { vote: "DISPUTE" } } },
      include: {
        plan: true,
        trustVotes: true,
        coHost: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: { disputedSlots, slotsWithDisputeVotes },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/admin/disputes/:slotId/resolve — Admin: resolve a dispute
// ---------------------------------------------------------------------------
export const resolveDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = req.params.slotId as string;
    const { resolution, reason } = req.body; // "release" | "refund" | "close"

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { plan: true },
    });

    if (!slot) throw new AppError("Slot not found", 404);

    switch (resolution) {
      case "release":
        // Release to host despite dispute
        await prisma.payment.updateMany({
          where: { slotId: slotId, status: "ESCROWED" },
          data: { status: "RELEASED" },
        });
        await prisma.slot.update({ where: { id: slotId }, data: { status: "ACTIVE", escrowLocked: false } });
        break;

      case "refund":
        // Refund to co-host
        await prisma.payment.updateMany({
          where: { slotId: slotId, status: "ESCROWED" },
          data: { status: "REFUNDED" },
        });
        await prisma.slot.update({ where: { id: slotId }, data: { status: "OPEN", coHostId: null, escrowLocked: false } });
        break;

      case "close":
        await prisma.slot.update({ where: { id: slotId }, data: { status: "CLOSED" } });
        break;

      default:
        throw new AppError("resolution must be 'release', 'refund', or 'close'", 400);
    }

    res.json({ success: true, message: `Dispute resolved: ${resolution}`, data: { slotId, resolution, reason } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/admin/users/:userId/trust — Admin: update user trust score
// ---------------------------------------------------------------------------
export const updateTrustScore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const { trustScore } = req.body;

    if (trustScore < 0 || trustScore > 100) {
      throw new AppError("trustScore must be 0–100", 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { trustScore },
      select: { id: true, name: true, trustScore: true },
    });

    res.json({ success: true, message: "Trust score updated", data: { user } });
  } catch (err) {
    next(err);
  }
};
