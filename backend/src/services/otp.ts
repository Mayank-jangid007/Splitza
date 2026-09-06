import crypto from "crypto";
import { prisma } from "../lib/prisma";

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;

/**
 * Generate a 6-digit OTP and store it for the given identifier (email or phone).
 */
export const generateOtp = (identifier: string): string => {
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(identifier, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
  return otp;
};

/**
 * Verify an OTP for the given identifier.
 * Returns true if valid, throws on failure.
 */
export const verifyOtp = (identifier: string, inputOtp: string): boolean => {
  const record = otpStore.get(identifier);

  if (!record) {
    throw new Error("OTP not found or already used. Please request a new one.");
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(identifier);
    throw new Error("Too many failed attempts. Please request a new OTP.");
  }

  record.attempts++;

  if (record.otp !== inputOtp) {
    throw new Error(`Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempt(s) remaining.`);
  }

  // OTP is valid — consume it
  otpStore.delete(identifier);
  return true;
};

/**
 * Send OTP via SMS (mocked in Phase 1-2, real SMS provider in Phase 3).
 * Also creates a notification in the DB for the user.
 */
export const sendOtp = async (
  userId: string | null,
  identifier: string,
  otp: string
): Promise<void> => {
  // === MOCK: Log to console ===
  console.log(`\n📱 [OTP RELAY] Sending OTP to ${identifier}`);
  console.log(`   Code: ${otp}`);
  console.log(`   Expires in: 10 minutes\n`);
  // TODO Phase 3: integrate SMS provider (Twilio / MSG91) + Google Pub/Sub relay

  // Store notification in DB if userId is provided
  if (userId) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "OTP_RELAY",
          title: "OTP Sent",
          body: `Your Splitza verification code is ${otp}. Valid for 10 minutes.`,
          metadata: { identifier, otp, sentAt: new Date().toISOString() },
        },
      });
    } catch {
      // Non-critical — don't fail if notification creation fails
    }
  }
};
