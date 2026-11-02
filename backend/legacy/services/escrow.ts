import { prisma } from "../lib/prisma";

type EscrowStatus = "LOCKED" | "RELEASED" | "REFUNDED" | "PENDING";

/**
 * Lock funds for a slot in escrow.
 * In Phase 3 this will call Razorpay Route to hold funds.
 * Returns the payment record.
 */
export const lockEscrow = async (
  slotId: string,
  userId: string,
  amount: number,
  upiRef?: string
) => {
  console.log(`🔒 [ESCROW] Locking ₹${amount} for slot ${slotId} (user: ${userId})`);

  const payment = await prisma.payment.create({
    data: {
      slotId,
      userId,
      amount,
      currency: "INR",
      status: "ESCROWED",
      upiRef: upiRef || `MOCK-UPI-${Date.now()}`,
    },
  });

  await prisma.slot.update({
    where: { id: slotId },
    data: { escrowLocked: true, escrowAmount: amount },
  });

  // Notify user
  await prisma.notification.create({
    data: {
      userId,
      type: "PAYMENT_RECEIVED",
      title: "Escrow Locked ✓",
      body: `₹${amount} is securely locked in escrow for your subscription slot.`,
      metadata: { slotId, paymentId: payment.id, amount },
    },
  });

  return payment;
};

/**
 * Release escrowed funds to the host after trust vote passes.
 * In Phase 3 this will trigger Razorpay Route transfer.
 */
export const releaseEscrow = async (slotId: string): Promise<void> => {
  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
    include: {
      plan: { include: { host: true } },
      payments: { where: { status: "ESCROWED" } },
    },
  });

  if (!slot) throw new Error("Slot not found");
  if (!slot.escrowLocked) throw new Error("No escrow to release");

  console.log(`⚡ [ESCROW] Releasing funds for slot ${slotId} → host ${slot.plan.hostId}`);

  // Mark all escrowed payments as released
  await prisma.payment.updateMany({
    where: { slotId, status: "ESCROWED" },
    data: { status: "RELEASED" },
  });

  // Update slot status
  await prisma.slot.update({
    where: { id: slotId },
    data: { escrowLocked: false, status: "ACTIVE" },
  });

  // Notify host
  const totalAmount = slot.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  await prisma.notification.create({
    data: {
      userId: slot.plan.hostId,
      type: "PAYOUT_RELEASED",
      title: "Payout Released! ⚡",
      body: `₹${totalAmount} has been released to your UPI for the ${slot.plan.service} plan.`,
      metadata: { slotId, amount: totalAmount, method: "UPI" },
    },
  });
};

/**
 * Refund escrowed funds to co-host on dispute resolution.
 */
export const refundEscrow = async (slotId: string, coHostId: string): Promise<void> => {
  console.log(`↩️ [ESCROW] Refunding escrow for slot ${slotId} → user ${coHostId}`);

  await prisma.payment.updateMany({
    where: { slotId, userId: coHostId, status: "ESCROWED" },
    data: { status: "REFUNDED" },
  });

  await prisma.notification.create({
    data: {
      userId: coHostId,
      type: "PAYOUT_RELEASED",
      title: "Refund Initiated",
      body: "Your escrowed funds are being refunded due to the dispute resolution.",
      metadata: { slotId },
    },
  });
};

/**
 * Get escrow status for a slot.
 */
export const getEscrowStatus = async (slotId: string): Promise<EscrowStatus> => {
  const payment = await prisma.payment.findFirst({
    where: { slotId },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) return "PENDING";
  return payment.status as EscrowStatus;
};
