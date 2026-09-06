import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { releaseEscrow } from "../services/escrow";

const TRUST_THRESHOLD = 0.6; // 60% TRUST votes trigger release

// ---------------------------------------------------------------------------
// POST /api/slots/:slotId/votes — Co-host: cast trust vote
// ---------------------------------------------------------------------------
export const castVote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slotId = req.params.slotId as string;
    const { vote } = req.body;
    const voterId = req.user!.id;

    if (!["TRUST", "DISPUTE"].includes(vote)) {
      throw new AppError("Vote must be TRUST or DISPUTE", 400);
    }

    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: {
        plan: { include: { slots: true } },
        trustVotes: true,
      },
    });

    if (!slot) throw new AppError("Slot not found", 404);
    if (slot.coHostId !== voterId) {
      throw new AppError("Only the slot's co-host can cast a vote", 403);
    }

    // Upsert vote (allow changing vote)
    const trustVote = await prisma.trustVote.upsert({
      where: { slotId_voterId: { slotId, voterId } },
      create: { slotId, voterId, vote },
      update: { vote },
    });

    // Check if payout should be triggered across the whole plan
    const allPlanSlots = slot.plan.slots.filter((s: { coHostId: string | null }) => s.coHostId !== null);
    if (allPlanSlots.length > 0) {
      const allVotes = await prisma.trustVote.findMany({
        where: { slotId: { in: allPlanSlots.map((s: { id: string }) => s.id) } },
      });

      const trustCount = allVotes.filter((v) => v.vote === "TRUST").length;
      const trustRatio = allVotes.length > 0 ? trustCount / allPlanSlots.length : 0;

      // Auto-release if >= 60% trust votes
      if (trustRatio >= TRUST_THRESHOLD && slot.escrowLocked) {
        try {
          await releaseEscrow(slotId);
          res.json({
            success: true,
            message: "Vote cast! Escrow released instantly based on trust votes.",
            data: { vote: trustVote, payoutTriggered: true, trustRatio: Math.round(trustRatio * 100) },
          });
          return;
        } catch (escrowErr) {
          console.error("Escrow release failed:", escrowErr);
        }
      }
    }

    res.json({
      success: true,
      message: `Vote '${vote}' recorded successfully`,
      data: { vote: trustVote, payoutTriggered: false },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/slots/:slotId/votes — Get votes for a slot
// ---------------------------------------------------------------------------
export const getVotes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const votes = await prisma.trustVote.findMany({
      where: { slotId: req.params.slotId as string },
      include: { voter: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });

    const trustCount = votes.filter((v) => v.vote === "TRUST").length;
    const disputeCount = votes.filter((v) => v.vote === "DISPUTE").length;

    res.json({
      success: true,
      data: {
        votes,
        summary: { total: votes.length, trust: trustCount, dispute: disputeCount },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/plans/:planId/votes — Get all votes for a host's plan
// ---------------------------------------------------------------------------
export const getPlanVotes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = req.params.planId as string;
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError("Plan not found", 404);
    if (plan.hostId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw new AppError("Not authorized", 403);
    }

    const slots = await prisma.slot.findMany({
      where: { planId },
      include: {
        trustVotes: {
          include: { voter: { select: { id: true, name: true } } },
        },
        coHost: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: { slots } });
  } catch (err) {
    next(err);
  }
};
