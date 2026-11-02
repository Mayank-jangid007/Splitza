/**
 * WebSocket Server — Phase 3
 *
 * Real-time push notifications to connected clients:
 * - OTP relay (co-hosts receive login OTPs instantly)
 * - Verification status updates
 * - Escrow / payout notifications
 * - Trust vote triggers
 *
 * Clients authenticate using their JWT access token as a query param:
 *   ws://localhost:5000/ws?token=<accessToken>
 */

import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";
import { verifyAccessToken } from "./jwt";
import { onOtpReceived, mockOtpEmitter, OtpPayload } from "./pubsub";
import { prisma } from "../lib/prisma";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AuthenticatedSocket = WebSocket & {
  userId?: string;
  planIds?: string[];
  isAlive: boolean;
};

type WsMessage = {
  type: "OTP_RELAY" | "VERIFICATION_UPDATE" | "ESCROW_UPDATE" | "TRUST_VOTE" | "NOTIFICATION" | "PING";
  payload: unknown;
};

// ---------------------------------------------------------------------------
// Connected clients registry
// ---------------------------------------------------------------------------
const clients = new Map<string, Set<AuthenticatedSocket>>(); // userId -> sockets

const addClient = (userId: string, socket: AuthenticatedSocket) => {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(socket);
  console.log(`🔌 [WS] Client connected: ${userId} (total: ${clients.size} users)`);
};

const removeClient = (userId: string, socket: AuthenticatedSocket) => {
  clients.get(userId)?.delete(socket);
  if (clients.get(userId)?.size === 0) clients.delete(userId);
  console.log(`🔌 [WS] Client disconnected: ${userId}`);
};

// ---------------------------------------------------------------------------
// Send message to a specific user's sockets
// ---------------------------------------------------------------------------
export const pushToUser = (userId: string, message: WsMessage): void => {
  const userSockets = clients.get(userId);
  if (!userSockets) return;

  const data = JSON.stringify(message);
  userSockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
};

// ---------------------------------------------------------------------------
// Broadcast OTP to all co-hosts of a plan
// ---------------------------------------------------------------------------
export const broadcastOtpToPlan = async (payload: OtpPayload): Promise<void> => {
  console.log(`📡 [WS] Broadcasting OTP to co-hosts of plan ${payload.planId}`);

  const slots = await prisma.slot.findMany({
    where: {
      planId: payload.planId,
      coHostId: { not: null },
      status: { in: ["ACTIVE", "LOCKED"] },
    },
    select: { coHostId: true },
  });

  // Also get host
  const plan = await prisma.plan.findUnique({
    where: { id: payload.planId },
    select: { hostId: true, service: true },
  });

  const recipients = new Set([
    ...(plan ? [plan.hostId] : []),
    ...slots.map((s) => s.coHostId!).filter(Boolean),
  ]);

  const message: WsMessage = {
    type: "OTP_RELAY",
    payload: {
      otp: payload.otp,
      planId: payload.planId,
      service: payload.slotId || plan?.service,
      expiresAt: payload.expiresAt,
      relayedAt: new Date().toISOString(),
    },
  };

  let pushed = 0;
  recipients.forEach((userId) => {
    pushToUser(userId, message);
    pushed++;
  });

  console.log(`✅ [WS] OTP broadcast to ${pushed} users`);

  // Also save as in-DB notification for users who aren't connected
  const notificationPromises = [...recipients].map((userId) =>
    prisma.notification.create({
      data: {
        userId,
        type: "OTP_RECEIVED",
        title: `🔐 Login OTP: ${payload.otp}`,
        body: `Your one-time password for ${plan?.service || "the subscription"} is ${payload.otp}. Valid for 5 minutes.`,
        metadata: { otp: payload.otp, planId: payload.planId },
      },
    }).catch(() => {}) // Non-critical
  );

  await Promise.allSettled(notificationPromises);
};

// ---------------------------------------------------------------------------
// Broadcast plan verification result
// ---------------------------------------------------------------------------
export const broadcastVerificationResult = async (
  planId: string,
  verified: boolean,
  service: string,
  screenshotPath?: string
): Promise<void> => {
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { slots: { select: { coHostId: true } } },
  });
  if (!plan) return;

  const recipients = [
    plan.hostId,
    ...plan.slots.map((s) => s.coHostId!).filter(Boolean),
  ];

  const message: WsMessage = {
    type: "VERIFICATION_UPDATE",
    payload: {
      planId,
      service,
      verified,
      screenshotPath,
      verifiedAt: new Date().toISOString(),
    },
  };

  recipients.forEach((userId) => pushToUser(userId, message));
};

// ---------------------------------------------------------------------------
// Broadcast escrow/payout event
// ---------------------------------------------------------------------------
export const broadcastEscrowUpdate = (
  userId: string,
  slotId: string,
  event: "LOCKED" | "RELEASED" | "REFUNDED",
  amount: number
): void => {
  pushToUser(userId, {
    type: "ESCROW_UPDATE",
    payload: { slotId, event, amount, timestamp: new Date().toISOString() },
  });
};

// ---------------------------------------------------------------------------
// Initialize WebSocket server
// ---------------------------------------------------------------------------
export const initWebSocketServer = (httpServer: Server): WebSocketServer => {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  console.log("🔌 [WS] WebSocket server initialized on /ws");

  // Heartbeat to clean up dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((rawSocket) => {
      const socket = rawSocket as AuthenticatedSocket;
      if (!socket.isAlive) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  wss.on("connection", async (rawSocket: WebSocket, req: IncomingMessage) => {
    const socket = rawSocket as AuthenticatedSocket;
    socket.isAlive = true;

    // Parse JWT from query string: ws://host/ws?token=...
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      socket.close(4001, "Unauthorized — no token provided");
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;

      // Load user's plan memberships for OTP filtering
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          hostedPlans: { select: { id: true } },
          joinedSlots: { select: { planId: true } },
        },
      });

      socket.planIds = [
        ...(user?.hostedPlans.map((p) => p.id) || []),
        ...(user?.joinedSlots.map((s) => s.planId) || []),
      ];

      addClient(payload.userId, socket);

      // Send connection acknowledgement
      socket.send(JSON.stringify({
        type: "CONNECTED",
        payload: { userId: payload.userId, message: "WebSocket connected to Splitza" },
      }));
    } catch {
      socket.close(4001, "Unauthorized — invalid token");
      return;
    }

    socket.on("pong", () => { socket.isAlive = true; });

    socket.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "PING") {
          socket.send(JSON.stringify({ type: "PONG", payload: { ts: Date.now() } }));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    socket.on("close", () => {
      if (socket.userId) removeClient(socket.userId, socket);
    });

    socket.on("error", (err) => {
      console.error(`[WS] Socket error for ${socket.userId}:`, err.message);
    });
  });

  // Wire Pub/Sub OTP events to WebSocket broadcasts
  onOtpReceived(async (payload) => {
    await broadcastOtpToPlan(payload);
  });

  // Also listen to mock emitter for dev
  mockOtpEmitter.on("otp", async (payload: OtpPayload) => {
    await broadcastOtpToPlan(payload);
  });

  return wss;
};
