/**
 * OTP Relay Controller — Phase 3
 *
 * Handles:
 * - POST /api/otp/relay        — host device sends captured OTP
 * - POST /api/otp/simulate     — dev-only, trigger a mock OTP
 * - GET  /api/otp/status/:planId — check if an OTP was recently relayed
 */

import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../lib/prisma";
import { receiveOtpWebhook, publishOtp } from "../services/pubsub";

// ---------------------------------------------------------------------------
// POST /api/otp/relay
// Called by the host's mobile device / browser extension
// ---------------------------------------------------------------------------
export const relayOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { planId, otp, service, secret } = req.body;

    if (!planId || !otp) {
      throw new AppError("planId and otp are required", 400);
    }

    if (!/^\d{4,8}$/.test(otp)) {
      throw new AppError("OTP must be 4–8 digits", 400);
    }

    await receiveOtpWebhook({ planId, otp, service, secret });

    res.json({
      success: true,
      message: "OTP relayed to all plan co-hosts",
      data: { planId, relayedAt: new Date().toISOString() },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/otp/simulate  (Development only)
// Manually triggers a fake OTP for testing the relay flow
// ---------------------------------------------------------------------------
export const simulateOtp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new AppError("OTP simulation is not available in production", 403);
    }

    const { planId } = req.body;
    if (!planId) throw new AppError("planId is required", 400);

    // Verify this user is the host of this plan
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError("Plan not found", 404);
    if (plan.hostId !== req.user!.id && req.user!.role !== "ADMIN") {
      throw new AppError("Only the host can simulate an OTP", 403);
    }

    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await publishOtp({
      planId,
      otp: mockOtp,
      service: plan.service,
      source: "manual",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    res.json({
      success: true,
      message: "Mock OTP sent to all co-hosts",
      data: { otp: mockOtp, planId },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/otp/status/:planId
// Returns recently relayed OTPs for this plan (last 10 minutes)
// ---------------------------------------------------------------------------
export const getOtpStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const planId = req.params.planId as string;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError("Plan not found", 404);

    // Check if user is host or active co-host of this plan
    const slot = await prisma.slot.findFirst({
      where: { planId: planId, coHostId: req.user!.id },
    });
    const isHost = plan.hostId === req.user!.id;
    const isCoHost = !!slot;
    const isAdmin = req.user!.role === "ADMIN";

    if (!isHost && !isCoHost && !isAdmin) {
      throw new AppError("Not authorized to view OTP status for this plan", 403);
    }

    // Fetch recent OTP notifications for this plan
    const recentOtpNotifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
        type: "OTP_RECEIVED",
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // last 10 min
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        metadata: true,
      },
    });

    res.json({
      success: true,
      data: {
        planId,
        recentOtps: recentOtpNotifications,
        wsEndpoint: `ws://${req.hostname}:${process.env.PORT || 5000}/ws`,
      },
    });
  } catch (err) {
    next(err);
  }
};
