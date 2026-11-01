// =============================================================
//  Splitza — poolManagement.service.ts
//  Host-only pool controls: visibility changes, invite links,
//  and safe deletion of pools that have no paid members.
// =============================================================

import { randomBytes } from "crypto";
import { prisma } from "../lib/prisma";
import { PoolServiceError } from "./createPool.service";

const INVITE_TOKEN_BYTES = 32;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const PAID_MEMBER_STATUSES = ["ACTIVE", "PENDING_PAYMENT", "INVITED"] as const;

function generateSecureToken(): string {
  return randomBytes(INVITE_TOKEN_BYTES).toString("hex");
}

function getAppBaseUrl(): string {
  const base =
    process.env.APP_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

/**
 * Build a shareable link for a pool. Private pools use the invite
 * token URL; pools without an active token fall back to discovery.
 */
export function buildInviteUrl(token: string | null): string {
  const base = getAppBaseUrl();
  return token ? `${base}/join/${token}` : `${base}/dashboard#marketplace`;
}

async function assertPoolHost(poolId: string, hostId: string) {
  const pool = await prisma.splitPool.findUnique({
    where: { id: poolId },
    select: {
      id: true,
      hostId: true,
      visibility: true,
      status: true,
      maxSeats: true,
    },
  });

  if (!pool) {
    throw new PoolServiceError("POOL_NOT_FOUND", "Subscription pool not found.", 404);
  }
  if (pool.hostId !== hostId) {
    throw new PoolServiceError(
      "NOT_POOL_HOST",
      "Only the pool host can perform this action.",
      403
    );
  }
  return pool;
}

async function findActiveInviteToken(poolId: string): Promise<string | null> {
  const link = await prisma.inviteLink.findFirst({
    where: {
      poolId,
      isRevoked: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    select: { token: true },
  });
  return link?.token ?? null;
}

async function getOrCreateInviteToken(
  poolId: string,
  hostId: string,
  maxUses: number
): Promise<string> {
  const existing = await findActiveInviteToken(poolId);
  if (existing) return existing;

  const token = generateSecureToken();
  await prisma.inviteLink.create({
    data: {
      poolId,
      token,
      createdById: hostId,
      maxUses: Math.max(1, maxUses),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });
  return token;
}

export interface UpdatePoolVisibilityResult {
  poolId: string;
  visibility: "PUBLIC" | "PRIVATE";
  inviteUrl: string;
}

export async function updatePoolVisibility(
  poolId: string,
  hostId: string,
  visibility: "PUBLIC" | "PRIVATE"
): Promise<UpdatePoolVisibilityResult> {
  if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
    throw new PoolServiceError(
      "INVALID_VISIBILITY",
      "visibility must be PUBLIC or PRIVATE."
    );
  }

  const pool = await assertPoolHost(poolId, hostId);

  const token =
    visibility === "PRIVATE"
      ? await getOrCreateInviteToken(poolId, hostId, pool.maxSeats - 1)
      : await findActiveInviteToken(poolId);

  if (pool.visibility !== visibility) {
    await prisma.splitPool.update({
      where: { id: poolId },
      data: { visibility },
    });

    await prisma.auditLog
      .create({
        data: {
          actorId: hostId,
          action: "POOL_VISIBILITY_UPDATED",
          entity: "SplitPool",
          entityId: poolId,
          metadata: { from: pool.visibility, to: visibility },
        },
      })
      .catch((err) => {
        console.error("[AuditLog] Failed to write POOL_VISIBILITY_UPDATED:", err);
      });
  }

  return {
    poolId,
    visibility,
    inviteUrl: buildInviteUrl(token),
  };
}

export async function deletePool(poolId: string, hostId: string): Promise<void> {
  await assertPoolHost(poolId, hostId);

  const paidMembers = await prisma.membership.count({
    where: {
      poolId,
      role: { not: "HOST" },
      status: { in: [...PAID_MEMBER_STATUSES] },
    },
  });

  if (paidMembers > 0) {
    throw new PoolServiceError(
      "POOL_HAS_PAID_MEMBERS",
      "You can only delete a pool while it has no paid members.",
      409
    );
  }

  await prisma.$transaction(async (tx) => {
    const memberships = await tx.membership.findMany({
      where: { poolId },
      select: { id: true },
    });
    const cycles = await tx.escrowCycle.findMany({
      where: { poolId },
      select: { id: true },
    });

    const membershipIds = memberships.map((m) => m.id);
    const cycleIds = cycles.map((c) => c.id);

    if (membershipIds.length > 0 || cycleIds.length > 0) {
      await tx.transaction.deleteMany({
        where: {
          OR: [
            { membershipId: { in: membershipIds } },
            { escrowCycleId: { in: cycleIds } },
          ],
        },
      });
    }

    await tx.escrowLedger.deleteMany({ where: { poolId } });
    await tx.escrowCycle.deleteMany({ where: { poolId } });
    await tx.dispute.deleteMany({ where: { poolId } });
    await tx.membership.deleteMany({ where: { poolId } });
    await tx.inviteLink.deleteMany({ where: { poolId } });
    await tx.poolCredential.deleteMany({ where: { poolId } });
    await tx.splitPool.delete({ where: { id: poolId } });
  }, {
    // Remote/serverless DBs (Neon) have higher per-query latency, so the
    // default 5s interactive-transaction timeout is too tight.
    maxWait: 10_000,
    timeout: 20_000,
  });

  await prisma.auditLog
    .create({
      data: {
        actorId: hostId,
        action: "POOL_DELETED",
        entity: "SplitPool",
        entityId: poolId,
      },
    })
    .catch((err) => {
      console.error("[AuditLog] Failed to write POOL_DELETED:", err);
    });
}
