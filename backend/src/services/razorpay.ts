/**
 * Razorpay Service — Phase 3
 *
 * Handles:
 * - UPI AutoPay mandate creation (recurring subscriptions)
 * - Webhook signature verification
 * - Escrow: Razorpay Route transfers (host payouts)
 * - Refunds to co-hosts
 *
 * Requires env vars:
 *   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
 *   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
 *   RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
const rzp = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : null;

const isConfigured = () => {
  if (!rzp) {
    console.warn("⚠️  [RAZORPAY] API keys not set — using mock mode");
    return false;
  }
  return true;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type MandateResult = {
  mandateId: string;
  status: "created" | "mock";
  shortUrl?: string;
  upiId?: string;
};

export type PayoutResult = {
  payoutId: string;
  status: "processed" | "mock";
  amount: number;
  utr?: string;
};

// ---------------------------------------------------------------------------
// 1. Create UPI AutoPay Subscription (Mandate)
// ---------------------------------------------------------------------------
export const createUpiMandate = async ({
  slotId,
  userId,
  amount,
  email,
  phone,
  name,
  billingCycle = "monthly",
}: {
  slotId: string;
  userId: string;
  amount: number;
  email: string;
  phone?: string;
  name: string;
  billingCycle?: string;
}): Promise<MandateResult> => {
  console.log(`💳 [RAZORPAY] Creating UPI mandate — Slot: ${slotId}, ₹${amount}`);

  if (!isConfigured()) {
    // Mock response for development
    const mockId = `MOCK_MANDATE_${Date.now()}`;
    await prisma.payment.create({
      data: {
        slotId,
        userId,
        amount,
        status: "ESCROWED",
        upiRef: mockId,
        razorpayId: mockId,
      },
    });
    await prisma.slot.update({
      where: { id: slotId },
      data: { escrowLocked: true, escrowAmount: amount },
    });
    return { mandateId: mockId, status: "mock" };
  }

  // Real Razorpay UPI AutoPay flow
  // Step 1: Create a Razorpay customer
  const customer = await (rzp!.customers as any).create({
    name,
    email,
    contact: phone || "",
    fail_existing: 0,
  });

  // Step 2: Create a UPI Autopay subscription plan
  const cycleMap: Record<string, string> = {
    monthly: "monthly",
    yearly: "yearly",
    quarterly: "quarterly",
  };

  const plan = await (rzp!.plans as any).create({
    period: cycleMap[billingCycle] || "monthly",
    interval: 1,
    item: {
      name: `Splitza Slot — ₹${amount}`,
      amount: amount * 100, // paise
      currency: "INR",
    },
  });

  // Step 3: Create subscription (mandate)
  const subscription = await (rzp!.subscriptions as any).create({
    plan_id: plan.id,
    customer_notify: 1,
    quantity: 1,
    total_count: 12, // 12 billing cycles
    addons: [],
    customer_id: customer.id,
    payment_method: "upi",
    notes: { slotId, userId },
  });

  // Persist pending payment record
  await prisma.payment.create({
    data: {
      slotId,
      userId,
      amount,
      status: "PENDING",
      razorpayId: subscription.id,
    },
  });

  console.log(`✅ [RAZORPAY] Mandate created: ${subscription.id}`);

  return {
    mandateId: subscription.id,
    status: "created",
    shortUrl: subscription.short_url,
  };
};

// ---------------------------------------------------------------------------
// 2. Verify Razorpay Webhook Signature
// ---------------------------------------------------------------------------
export const verifyWebhookSignature = (
  rawBody: string,
  signature: string
): boolean => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret) {
    console.warn("⚠️  [RAZORPAY] Webhook secret not set — skipping verification");
    return true; // Allow in dev
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signature, "hex")
  );
};

// ---------------------------------------------------------------------------
// 3. Release Escrow — Razorpay Route Transfer to Host
// ---------------------------------------------------------------------------
export const releaseFundsToHost = async ({
  slotId,
  hostUpiId,
  amount,
}: {
  slotId: string;
  hostUpiId: string;
  amount: number;
}): Promise<PayoutResult> => {
  console.log(`💸 [RAZORPAY] Releasing ₹${amount} to ${hostUpiId} for slot ${slotId}`);

  if (!isConfigured()) {
    // Mock payout
    await prisma.payment.updateMany({
      where: { slotId, status: "ESCROWED" },
      data: { status: "RELEASED" },
    });
    await prisma.slot.update({
      where: { id: slotId },
      data: { escrowLocked: false },
    });
    return { payoutId: `MOCK_PAYOUT_${Date.now()}`, status: "mock", amount };
  }

  // Real Razorpay Payout (Route)
  const payout = await (rzp as any).payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || "",
    amount: Math.round(amount * 0.95 * 100), // 5% platform fee deducted
    currency: "INR",
    mode: "UPI",
    purpose: "payout",
    fund_account: {
      account_type: "vpa",
      vpa: { address: hostUpiId },
      contact: {
        name: "Splitza Host",
        type: "vendor",
      },
    },
    queue_if_low_balance: true,
    reference_id: slotId,
    narration: "Splitza — Subscription Payout",
    notes: { slotId },
  });

  await prisma.payment.updateMany({
    where: { slotId, status: "ESCROWED" },
    data: { status: "RELEASED" },
  });

  console.log(`✅ [RAZORPAY] Payout created: ${payout.id}`);
  return {
    payoutId: payout.id,
    status: "processed",
    amount: payout.amount / 100,
    utr: payout.utr,
  };
};

// ---------------------------------------------------------------------------
// 4. Refund to Co-host
// ---------------------------------------------------------------------------
export const refundToCohost = async ({
  paymentId,
  amount,
}: {
  paymentId: string;
  amount: number;
}): Promise<void> => {
  console.log(`↩️  [RAZORPAY] Refunding ₹${amount} for payment ${paymentId}`);

  if (!isConfigured()) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REFUNDED" },
    });
    return;
  }

  await (rzp!.payments as any).refund(paymentId, {
    amount: amount * 100,
    notes: { reason: "Co-host dispute resolution — Splitza" },
  });

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED" },
  });

  console.log(`✅ [RAZORPAY] Refund processed`);
};
