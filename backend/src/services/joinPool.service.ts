// =============================================================
//  Splitza — joinPool.service.ts
//  Secure join flow: validates eligibility, verifies invite
//  tokens for private pools, mocks UPI payment collection,
//  and atomically adds the member to the pool.
// =============================================================

import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PoolServiceError } from "../services/createPool.service";
import type { IMembership } from "../types/db.types";

// ─────────────────────────────────────────────
//  Input Contract
// ─────────────────────────────────────────────

export interface JoinPoolInput {
  userId:      string;
  poolId:      string;
  inviteToken?: string;   // required for PRIVATE pools
}

// ─────────────────────────────────────────────
//  Output Contract
// ─────────────────────────────────────────────

export interface JoinPoolResult {
  membership:      IMembership;
  paymentReceipt:  MockPaymentReceipt;
  poolStatus:      string;   // "OPEN" | "FULL" — status after join
  openSeatsLeft:   number;
}

export interface MockPaymentReceipt {
  transactionId:   string;
  amountCollected: number;   // totalCostINR = pricePerSeat × planMonths
  currency:        string;
  mandateId:       string;   // simulated UPI AutoPay mandate
  status:          "COLLECTED";
  collectedAt:     Date;
}

// ─────────────────────────────────────────────
//  Mock Payment Gateway
// ─────────────────────────────────────────────

/**
 * mockCollectUpfrontPayment
 *
 * Simulates collecting 100% of the full plan cost from the
 * joining member at the moment they join.
 *
 * Replace with Razorpay / Cashfree UPI AutoPay mandate API call:
 *   - createMandate(userId, amount, upiId)  → mandateId
 *   - debitMandate(mandateId, amount)       → txnId
 *
 * Returns a mock receipt that is persisted as a Transaction record.
 */
async function mockCollectUpfrontPayment(params: {
  userId:          string;
  membershipId:    string;
  escrowCycleId:   string;
  amountINR:       number;
}): Promise<MockPaymentReceipt> {
  const { randomUUID, randomBytes } = await import("crypto");

  // Simulate ~200 ms gateway latency in dev
  if (process.env.NODE_ENV !== "production") {
    await new Promise((r) => setTimeout(r, 200));
  }

  const transactionId = `txn_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const mandateId     = `mnd_${randomBytes(8).toString("hex")}`;
  const collectedAt   = new Date();

  // Persist the mock transaction record
  await prisma.transaction.create({
    data: {
      type:          "MEMBER_COLLECTION",
      status:        "SUCCESS",
      amount:        new Prisma.Decimal(params.amountINR).toDecimalPlaces(2),
      currency:      "INR",
      userId:        params.userId,
      membershipId:  params.membershipId,
      escrowCycleId: params.escrowCycleId,
      upiTransactionId: transactionId,
      mandateId,
      processedAt:   collectedAt,
    },
  });

  return {
    transactionId,
    amountCollected: params.amountINR,
    currency:        "INR",
    mandateId,
    status:          "COLLECTED",
    collectedAt,
  };
}

// ─────────────────────────────────────────────
//  Join Service
// ─────────────────────────────────────────────

/**
 * joinPool
 *
 * Secure member join flow. Enforces all eligibility checks
 * before touching the database.
 *
 * @throws {PoolServiceError} on any validation or business rule failure
 */
export async function joinPool(
  input: JoinPoolInput
): Promise<JoinPoolResult> {

  // ── 1. Basic input guards ────────────────────────────────────
  if (!input.userId?.trim()) {
    throw new PoolServiceError("MISSING_USER_ID", "userId is required.");
  }
  if (!input.poolId?.trim()) {
    throw new PoolServiceError("MISSING_POOL_ID", "poolId is required.");
  }

  // ── 2. Load pool with live seat count ───────────────────────
  const pool = await prisma.splitPool.findUnique({
    where: { id: input.poolId },
    include: {
      _count: {
        select: {
          memberships: {
            where: { status: { in: ["ACTIVE", "PENDING_PAYMENT"] } },
          },
        },
      },
    },
  });

  if (!pool) {
    throw new PoolServiceError("POOL_NOT_FOUND", "Subscription pool not found.", 404);
  }

  // ── 3. Status check: must be OPEN (joinable) ─────────────────
  if (pool.status !== "OPEN") {
    const reasonMap: Record<string, string> = {
      DRAFT:      "This pool is not published yet.",
      FULL:       "This pool is fully booked.",
      ACTIVE:     "This pool has already started its billing cycle.",
      PAUSED:     "This pool is temporarily paused.",
      ENDED:      "This pool has ended.",
      CANCELLED:  "This pool has been cancelled.",
    };
    throw new PoolServiceError(
      "POOL_NOT_JOINABLE",
      reasonMap[pool.status] ?? "This pool is not accepting members.",
      409
    );
  }

  // ── 4. Seat availability check (live count) ──────────────────
  const filledSeats = pool._count.memberships;
  if (filledSeats >= pool.maxSeats) {
    throw new PoolServiceError(
      "POOL_FULL",
      `All ${pool.maxSeats} seats are taken. No slots available.`,
      409
    );
  }

  // ── 5. Duplicate membership guard ───────────────────────────
  const existing = await prisma.membership.findUnique({
    where: {
      userId_poolId: { userId: input.userId, poolId: input.poolId },
    },
    select: { status: true },
  });
  if (existing) {
    if (existing.status === "LEFT" || existing.status === "REMOVED") {
      throw new PoolServiceError(
        "MEMBERSHIP_TERMINATED",
        "Your previous membership in this pool was ended. You cannot rejoin.",
        409
      );
    }
    throw new PoolServiceError(
      "ALREADY_MEMBER",
      "You are already a member of this pool.",
      409
    );
  }

  // ── 6. PRIVATE pool — invite token validation ────────────────
  if (pool.visibility === "PRIVATE") {
    if (!input.inviteToken?.trim()) {
      throw new PoolServiceError(
        "INVITE_TOKEN_REQUIRED",
        "This is a private pool. An invite token is required to join.",
        403
      );
    }

    const link = await prisma.inviteLink.findUnique({
      where: { token: input.inviteToken.trim() },
      select: {
        id:        true,
        poolId:    true,
        isRevoked: true,
        expiresAt: true,
        maxUses:   true,
        useCount:  true,
      },
    });

    // Deliberate: use identical error messages for "not found" and
    // "wrong pool" to prevent token-fishing attacks.
    if (!link || link.poolId !== input.poolId) {
      throw new PoolServiceError(
        "INVALID_INVITE_TOKEN",
        "Invite token is invalid or does not belong to this pool.",
        403
      );
    }
    if (link.isRevoked) {
      throw new PoolServiceError(
        "INVITE_TOKEN_REVOKED",
        "This invite link has been revoked by the host.",
        403
      );
    }
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new PoolServiceError(
        "INVITE_TOKEN_EXPIRED",
        "This invite link has expired. Request a new one from the host.",
        403
      );
    }
    if (link.maxUses !== null && link.useCount >= link.maxUses) {
      throw new PoolServiceError(
        "INVITE_TOKEN_EXHAUSTED",
        "This invite link has reached its maximum number of uses.",
        403
      );
    }
  }

  // ── 7. Member must exist & be active ────────────────────────
  const member = await prisma.user.findUnique({
    where:  { id: input.userId },
    select: { id: true, isActive: true, verificationStatus: true },
  });
  if (!member) {
    throw new PoolServiceError("USER_NOT_FOUND", "Member account not found.", 404);
  }
  if (!member.isActive) {
    throw new PoolServiceError(
      "USER_INACTIVE",
      "Your account is deactivated. Contact support.",
      403
    );
  }

  // ── 8. Calculate full upfront payment amount ─────────────────
  // 100% of the entire plan term is collected on join.
  const upfrontAmountINR = Number(pool.pricePerSeat) * pool.planMonths;

  // ── 9. Atomic transaction ─────────────────────────────────────
  let newMembership: Awaited<ReturnType<typeof prisma.membership.create>>;
  let escrowCycleId: string;

  const result = await prisma.$transaction(
    async (tx) => {

      // 9a. Re-check seat count inside the transaction to prevent
      //     race conditions between the check above and the insert.
      const liveCount = await tx.membership.count({
        where: {
          poolId: input.poolId,
          status: { in: ["ACTIVE", "PENDING_PAYMENT"] },
        },
      });
      if (liveCount >= pool.maxSeats) {
        throw new PoolServiceError(
          "POOL_FULL",
          "All seats were just taken by another user. Please try again.",
          409
        );
      }

      // 9b. Create the Membership record
      const membership = await tx.membership.create({
        data: {
          userId:           input.userId,
          poolId:           input.poolId,
          role:             "MEMBER",
          status:           "PENDING_PAYMENT",   // moves to ACTIVE after payment
          priceAtJoin:      pool.pricePerSeat,
          planMonthsAtJoin: pool.planMonths,
        },
      });

      // 9c. Get or create the escrow cycle for cycle #1
      const escrowCycle = await tx.escrowCycle.upsert({
        where:  { poolId_cycleNumber: { poolId: input.poolId, cycleNumber: 1 } },
        create: {
          poolId:        input.poolId,
          cycleNumber:   1,
          status:        "COLLECTING",
          totalExpected: new Prisma.Decimal(upfrontAmountINR),
          collectionStartAt: new Date(),
        },
        update: {
          // Increment expected total as more members join
          totalExpected: {
            increment: new Prisma.Decimal(upfrontAmountINR),
          },
        },
      });

      // 9d. Update invite link use count if PRIVATE
      if (pool.visibility === "PRIVATE" && input.inviteToken) {
        await tx.inviteLink.update({
          where: { token: input.inviteToken.trim() },
          data:  { useCount: { increment: 1 } },
        });
      }

      // 9e. Check if this join makes the pool full and trigger activation
      const newFilledCount = liveCount + 1;
      const isNowFull      = newFilledCount >= pool.maxSeats;

      if (isNowFull) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + pool.planMonths);

        // Update pool status and dates
        await tx.splitPool.update({
          where: { id: input.poolId },
          data:  { 
            status: "ACTIVE",
            startDate,
            endDate
          },
        });

        // 9f. Generate 4 EscrowLedger entries for the host (25% each, weekly increments)
        // Note: The total funds collected from members is (maxSeats - 1) * pricePerSeat * planMonths
        // Since the host's own share isn't collected into escrow.
        const totalMemberFunds = pool.pricePerSeat.mul(pool.maxSeats - 1).mul(pool.planMonths);
        const payoutAmount = totalMemberFunds.div(4).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

        // Weekly increments (7 days)
        const weeklyMs = 7 * 24 * 60 * 60 * 1000;
        
        for (let i = 1; i <= 4; i++) {
          await tx.escrowLedger.create({
            data: {
              poolId: input.poolId,
              hostId: pool.hostId,
              amount: payoutAmount,
              currency: pool.currency,
              scheduledFor: new Date(startDate.getTime() + (weeklyMs * i)),
              status: "PENDING"
            }
          });
        }
      }

      return { membership, escrowCycle, isNowFull, newFilledCount };
    },
    {
      isolationLevel: "Serializable",
      timeout:        8_000,
    }
  );

  newMembership = result.membership;
  escrowCycleId = result.escrowCycle.id;

  // ── 10. Collect upfront payment (outside TX to avoid timeout) ─
  const paymentReceipt = await mockCollectUpfrontPayment({
    userId:        input.userId,
    membershipId:  newMembership.id,
    escrowCycleId,
    amountINR:     upfrontAmountINR,
  });

  // ── 11. Activate membership after payment confirmation ────────
  await prisma.membership.update({
    where: { id: newMembership.id },
    data:  {
      status:          "ACTIVE",
      mandateId:       paymentReceipt.mandateId,
      mandateStatus:   "ACTIVE",
      mandateCreatedAt: paymentReceipt.collectedAt,
    },
  });

  // ── 12. Update escrow collected total ─────────────────────────
  await prisma.escrowCycle.update({
    where: { id: escrowCycleId },
    data:  {
      totalCollected: { increment: new Prisma.Decimal(upfrontAmountINR) },
    },
  });

  // ── 13. Notify the host ───────────────────────────────────────
  const hostMembership = await prisma.membership.findFirst({
    where:  { poolId: input.poolId, role: "HOST" },
    select: { userId: true },
  });
  if (hostMembership) {
    await prisma.notification.create({
      data: {
        userId: hostMembership.userId,
        type:   "MEMBER_JOINED",
        title:  "New member joined your pool!",
        body:   `A new member has joined your subscription pool. ${
          result.isNowFull ? "Your pool is now full." : ""
        }`,
        metadata: {
          poolId:       input.poolId,
          newMemberId:  input.userId,
          filledSeats:  result.newFilledCount,
          maxSeats:     pool.maxSeats,
          poolIsFull:   result.isNowFull,
        },
      },
    }).catch((err) => {
      console.error("[joinPool] Failed to send host notification:", err);
    });
  }

  // ── 14. Audit log ─────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      actorId:  input.userId,
      action:   "POOL_JOINED",
      entity:   "Membership",
      entityId: newMembership.id,
      metadata: {
        poolId:          input.poolId,
        visibility:      pool.visibility,
        amountCollected: upfrontAmountINR,
        mandateId:       paymentReceipt.mandateId,
        poolIsFull:      result.isNowFull,
      },
    },
  }).catch((err) => {
    console.error("[AuditLog] Failed to write POOL_JOINED:", err);
  });

  return {
    membership:    newMembership as unknown as IMembership,
    paymentReceipt,
    poolStatus:    result.isNowFull ? "ACTIVE" : "OPEN",
    openSeatsLeft: Math.max(0, pool.maxSeats - result.newFilledCount),
  };
}
