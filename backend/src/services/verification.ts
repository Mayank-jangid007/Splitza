import { prisma } from "../lib/prisma";

type VerificationResult = {
  verified: boolean;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "ERROR";
  details: string;
  checkedAt: string;
};

/**
 * Mock plan verification using a simulated browser bot.
 * In Phase 3 this will use Puppeteer/Playwright to:
 * 1. Navigate to the service login page
 * 2. Log in with host credentials
 * 3. Check that the subscription/plan is active
 * 4. Return a structured verification result
 *
 * Mock success rate: 95% (simulate realistic bot behavior)
 */
export const verifyPlan = async (planId: string): Promise<VerificationResult> => {
  console.log(`🤖 [VERIFICATION BOT] Checking plan ${planId}...`);

  // Simulate bot execution delay (1-3 seconds)
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));

  // Simulate 95% success rate
  const isActive = Math.random() > 0.05;
  const result: VerificationResult = {
    verified: isActive,
    status: isActive ? "ACTIVE" : "INACTIVE",
    details: isActive
      ? "Plan confirmed active by automated browser verification."
      : "Plan could not be verified. Host may need to re-authenticate.",
    checkedAt: new Date().toISOString(),
  };

  if (result.verified) {
    // Update plan status to ACTIVE
    await prisma.plan.update({
      where: { id: planId },
      data: {
        status: "ACTIVE",
        verifiedAt: new Date(),
      },
    });

    // Notify host
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (plan) {
      await prisma.notification.create({
        data: {
          userId: plan.hostId,
          type: "PLAN_VERIFIED",
          title: "Plan Verified ✓",
          body: `Your ${plan.service} (${plan.tier}) plan has been verified as active by our bot.`,
          metadata: { planId, verifiedAt: result.checkedAt },
        },
      });
    }
  } else {
    await prisma.plan.update({
      where: { id: planId },
      data: { status: "SUSPENDED" },
    });
  }

  console.log(
    `🤖 [VERIFICATION BOT] Result: ${result.status} — ${result.details}`
  );
  return result;
};

/**
 * Queue a background verification job.
 * In Phase 3 this will enqueue a Pub/Sub message.
 */
export const queueVerification = (planId: string): void => {
  console.log(`📬 [VERIFICATION QUEUE] Queued verification for plan ${planId}`);
  // Run async without blocking the request
  verifyPlan(planId).catch((err) =>
    console.error(`[VERIFICATION ERROR] Plan ${planId}:`, err.message)
  );
};
