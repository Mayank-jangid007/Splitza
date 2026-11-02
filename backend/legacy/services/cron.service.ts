// =============================================================
//  Splitza — cron.service.ts
//  Lifespan Expiration Cron Job
//  Scans for ACTIVE pools that have reached their expiryDate,
//  expires them, voids invite tokens, locks credentials,
//  and sends end-of-term notifications to all members.
// =============================================================

import { prisma } from "../lib/prisma";

/**
 * processExpiredPools
 * 
 * Scheduled automated cleanup script.
 * Can be run via a scheduler like node-cron, BullMQ, or an AWS EventBridge trigger.
 */
export async function processExpiredPools(): Promise<{ processedCount: number }> {
  console.log(`[Cron] Starting lifespan expiration check at ${new Date().toISOString()}...`);

  // 1. Identify all groups where currentTimestamp >= expiryDate and status == 'ACTIVE'
  const expiredPools = await prisma.splitPool.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        lte: new Date(), // Less than or equal to current time
      },
    },
    select: {
      id: true,
      maxSeats: true,
      hostId: true,
      memberships: {
        where: { status: { in: ["ACTIVE", "PENDING_PAYMENT"] } },
        select: { id: true, userId: true },
      },
      inviteLinks: {
        where: { isRevoked: false },
        select: { id: true },
      },
      credentials: {
        select: { id: true },
      }
    },
  });

  if (expiredPools.length === 0) {
    console.log("[Cron] No expired pools found.");
    return { processedCount: 0 };
  }

  console.log(`[Cron] Found ${expiredPools.length} expired pools. Processing...`);

  let processedCount = 0;

  for (const pool of expiredPools) {
    try {
      // 2. Atomic database transaction to expire the pool
      await prisma.$transaction(async (tx) => {
        // a. Update group status to 'EXPIRED' (using 'ENDED' as defined in schema PoolStatus)
        await tx.splitPool.update({
          where: { id: pool.id },
          data: { status: "ENDED" },
        });

        // b. Update membership statuses to 'EXPIRED'
        const membershipIds = pool.memberships.map((m) => m.id);
        if (membershipIds.length > 0) {
          await tx.membership.updateMany({
            where: { id: { in: membershipIds } },
            data: { status: "EXPIRED" },
          });
        }

        // c. Completely void the inviteToken (revoke active links)
        const activeLinkIds = pool.inviteLinks.map((link) => link.id);
        if (activeLinkIds.length > 0) {
          await tx.inviteLink.updateMany({
            where: { id: { in: activeLinkIds } },
            data: { isRevoked: true },
          });
        }

        // d. Lock the credential records (delete or scrub them to prevent further access)
        // Since we want to 'lock' them, we'll clear the encrypted fields.
        if (pool.credentials) {
          await tx.poolCredential.update({
            where: { id: pool.credentials.id },
            data: {
              encryptedUsername: null,
              encryptedPassword: null,
              encryptedInviteLink: null,
              iv: "LOCKED",
            },
          });
        }

        // e. Audit log
        await tx.auditLog.create({
          data: {
            action: "POOL_EXPIRED_CRON",
            entity: "SplitPool",
            entityId: pool.id,
            metadata: {
              membersAffected: membershipIds.length,
            },
          },
        });
      });

      // 3. Return an event stream (send notifications) telling members the term is dead
      const notificationsToCreate = pool.memberships.map((membership) => ({
        userId: membership.userId,
        type: "PLAN_ENDED" as const,
        title: "Subscription Term Ended",
        body: "Your subscription plan has reached the end of its term and is now closed. Coordinate with your host to negotiate a Re-Pool if you wish to continue.",
        metadata: {
          poolId: pool.id,
        },
      }));

      if (notificationsToCreate.length > 0) {
        await prisma.notification.createMany({
          data: notificationsToCreate,
        });
      }

      console.log(`[Cron] Successfully expired pool ${pool.id}`);
      processedCount++;
    } catch (error) {
      console.error(`[Cron] Failed to process expired pool ${pool.id}:`, error);
      // Continue to next pool even if one fails
    }
  }

  console.log(`[Cron] Finished lifespan expiration check. Processed ${processedCount} pools.`);
  return { processedCount };
}

// ─────────────────────────────────────────────
// Simple Runner (for testing/invoking manually)
// ─────────────────────────────────────────────
if (require.main === module) {
  processExpiredPools()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Cron script failed:", err);
      process.exit(1);
    });
}
