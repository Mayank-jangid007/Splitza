// =============================================================
//  Splitza — pools.controller.ts
//  HTTP adapter between Express router and createPool service.
// =============================================================

import type { Request, Response } from "express";
import {
  createPool,
  PoolServiceError,
  type CreatePoolInput,
} from "../services/createPool.service";
import { joinPool } from "../services/joinPool.service";
import { prisma } from "../lib/prisma";

// ─────────────────────────────────────────────
//  POST /api/pools
// ─────────────────────────────────────────────

export async function handleCreatePool(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;

    // ── Coerce & forward to service ───────────────────────────
    const input = body as CreatePoolInput;

    // hostId is injected by auth middleware — never trusted from body
    input.hostId = (req as any).user!.id;

    const result = await createPool(input);

    res.status(201).json({
      ok: true,
      data: {
        poolId:     result.pool.id,
        status:     result.pool.status,
        pricePerSeat: Number(result.pool.pricePerSeat),
        inviteToken: result.inviteToken ?? undefined, // only present for PRIVATE
        inviteUrl:   result.inviteToken
          ? `${process.env.APP_BASE_URL}/join/${result.inviteToken}`
          : undefined,
      },
    });
  } catch (err) {
    if (err instanceof PoolServiceError) {
      res.status(err.statusHint).json({
        ok:      false,
        code:    err.code,
        message: err.message,
      });
      return;
    }

    console.error("[POST /api/pools] Unhandled error:", err);
    res.status(500).json({
      ok:      false,
      code:    "INTERNAL_ERROR",
      message: "An unexpected error occurred. Please try again.",
    });
  }
}

// ─────────────────────────────────────────────
//  POST /api/pools/:poolId/join
// ─────────────────────────────────────────────

export async function handleJoinPool(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { poolId } = req.params;
    const { inviteToken } = req.body as { inviteToken?: string };

    // userId is injected by auth middleware — never trusted from body
    const userId = (req as any).user!.id;

    if (!poolId) {
      res.status(400).json({
        ok: false,
        code: "MISSING_POOL_ID",
        message: "Pool ID is required.",
      });
      return;
    }

    const result = await joinPool({
      userId,
      poolId,
      inviteToken,
    });

    res.status(200).json({
      ok: true,
      data: {
        membershipId: result.membership.id,
        status: result.membership.status,
        paymentReceipt: result.paymentReceipt,
        poolStatus: result.poolStatus,
        openSeatsLeft: result.openSeatsLeft,
      },
    });
  } catch (err) {
    if (err instanceof PoolServiceError) {
      res.status(err.statusHint).json({
        ok: false,
        code: err.code,
        message: err.message,
      });
      return;
    }

    console.error(`[POST /api/pools/${req.params.poolId}/join] Unhandled error:`, err);
    res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred while joining the pool. Please try again.",
    });
  }
}

// ─────────────────────────────────────────────
//  GET /api/pools/my
// ─────────────────────────────────────────────
export async function handleGetMyPools(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).user!.id;
    
    // Fetch pools hosted by the user
    const hostedPools = await prisma.splitPool.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        host: { select: { name: true } }
      }
    });
    
    // Map them to the frontend Pool format
    const formattedPools = hostedPools.map(p => ({
      id: p.id,
      name: p.customName || p.platformConfigId || "Split Pool",
      host: p.host.name || "You",
      pricePerSeat: Number(p.pricePerSeat),
      maxSeats: p.maxSeats,
      filledSeats: 1, // simplified for now
      status: p.status,
      visibility: p.visibility,
      planMonths: p.planMonths,
    }));
    
    res.status(200).json({
      ok: true,
      data: formattedPools
    });
  } catch (err) {
    console.error("[GET /api/pools/my] Unhandled error:", err);
    res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred while fetching your pools.",
    });
  }
}
