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
import {
  getPoolCredentials,
  CredentialAccessError,
} from "../services/credential.service";
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

    // After payment succeeds membership is ACTIVE — unlock credentials
    let credentials: Awaited<ReturnType<typeof getPoolCredentials>> | null = null;
    try {
      credentials = await getPoolCredentials(poolId, userId);
    } catch {
      credentials = null; // host may not have uploaded creds yet
    }

    res.status(200).json({
      ok: true,
      data: {
        membershipId: result.membership.id,
        status: "ACTIVE",
        paymentReceipt: result.paymentReceipt,
        poolStatus: result.poolStatus,
        openSeatsLeft: result.openSeatsLeft,
        credentials: credentials
          ? {
              username: credentials.username,
              password: credentials.password,
              inviteLink: credentials.inviteLink,
              seatNo: credentials.seatNo,
              pin: credentials.pin,
            }
          : null,
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
//  GET /api/pools/:poolId/credentials
//  Host or ACTIVE paid member only — returns decrypted creds
// ─────────────────────────────────────────────

export async function handleGetPoolCredentials(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { poolId } = req.params;
    const userId = (req as any).user!.id;

    if (!poolId) {
      res.status(400).json({
        ok: false,
        code: "MISSING_POOL_ID",
        message: "Pool ID is required.",
      });
      return;
    }

    const creds = await getPoolCredentials(poolId, userId);

    res.status(200).json({
      ok: true,
      data: {
        username: creds.username,
        password: creds.password,
        inviteLink: creds.inviteLink,
        seatNo: creds.seatNo,
        pin: creds.pin,
      },
    });
  } catch (err) {
    if (err instanceof CredentialAccessError || err instanceof PoolServiceError) {
      const e = err as CredentialAccessError | PoolServiceError;
      res.status(e.statusHint).json({
        ok: false,
        code: e.code,
        message: e.message,
      });
      return;
    }

    console.error(`[GET /api/pools/${req.params.poolId}/credentials] Unhandled error:`, err);
    res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Failed to fetch credentials.",
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

    // Fetch all memberships for this user (includes both HOST and MEMBER roles)
    const memberships = await prisma.membership.findMany({
      where: { userId, status: { not: "REMOVED" } },
      include: {
        pool: {
          include: {
            host: { select: { name: true } },
            memberships: { where: { status: "ACTIVE" }, select: { id: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPools = memberships.map((m) => {
      const p = m.pool;
      const filledSeats = p.memberships.length;
      return {
        id: p.id,
        name: p.customName || p.platformConfigId || "Split Pool",
        host: m.role === "HOST" ? "You" : p.host.name,
        pricePerSeat: Number(p.pricePerSeat),
        maxSeats: p.maxSeats,
        filledSeats,
        status: p.status,
        visibility: p.visibility,
        planMonths: p.planMonths,
        planDays: p.planDays ?? p.planMonths * 30,
        monthlyPlanCost: p.customPricePerMonth != null ? Number(p.customPricePerMonth) : undefined,
        startDate: p.startDate?.toISOString(),
        role: m.role, // "HOST" | "MEMBER"
      };
    });

    res.status(200).json({
      ok: true,
      data: formattedPools,
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
