/**
 * Google Cloud Pub/Sub Service — Phase 3
 *
 * Used for real-time OTP relay:
 * - Subscription services send OTP to the host's phone/email
 * - The bot captures it and publishes to a Pub/Sub topic
 * - Subscribers (co-hosts via WebSocket) receive it instantly
 *
 * Requires env vars:
 *   PUBSUB_PROJECT_ID=splitza-prod
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *   (or GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}')
 */

import { PubSub, Message } from "@google-cloud/pubsub";

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
let pubsubClient: PubSub | null = null;

const getClient = (): PubSub | null => {
  if (pubsubClient) return pubsubClient;

  const projectId = process.env.PUBSUB_PROJECT_ID;
  if (!projectId) {
    console.warn("⚠️  [PUBSUB] PUBSUB_PROJECT_ID not set — using mock mode");
    return null;
  }

  // Support inline JSON credentials (for environments without file access)
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  if (credentialsJson) {
    try {
      const credentials = JSON.parse(credentialsJson);
      pubsubClient = new PubSub({ projectId, credentials });
    } catch {
      console.error("❌ [PUBSUB] Failed to parse GOOGLE_CREDENTIALS_JSON");
      return null;
    }
  } else {
    // Uses GOOGLE_APPLICATION_CREDENTIALS env var automatically
    pubsubClient = new PubSub({ projectId });
  }

  console.log(`✅ [PUBSUB] Connected — Project: ${projectId}`);
  return pubsubClient;
};

// ---------------------------------------------------------------------------
// Topic / Subscription names
// ---------------------------------------------------------------------------
const OTP_TOPIC = process.env.PUBSUB_OTP_TOPIC || "splitza-otp-relay";
const OTP_SUBSCRIPTION = process.env.PUBSUB_OTP_SUBSCRIPTION || "splitza-otp-relay-sub";

// ---------------------------------------------------------------------------
// Publish OTP
// ---------------------------------------------------------------------------
export type OtpPayload = {
  planId: string;
  slotId?: string;
  otp: string;
  service?: string;
  source: "bot-intercept" | "webhook" | "manual";
  expiresAt?: string;
};

export const publishOtp = async (payload: OtpPayload): Promise<void> => {
  console.log(`📡 [PUBSUB] Publishing OTP for plan ${payload.planId}: ${payload.otp}`);

  const client = getClient();

  if (!client) {
    // Mock: broadcast via in-process event emitter instead
    mockOtpBroadcast(payload);
    return;
  }

  const topic = client.topic(OTP_TOPIC);
  const messageBuffer = Buffer.from(
    JSON.stringify({
      ...payload,
      publishedAt: new Date().toISOString(),
    })
  );

  const messageId = await topic.publishMessage({ data: messageBuffer });
  console.log(`✅ [PUBSUB] OTP published — Message ID: ${messageId}`);
};

// ---------------------------------------------------------------------------
// Subscribe to OTP messages (for server-side relay to WebSocket clients)
// ---------------------------------------------------------------------------
type OtpHandler = (payload: OtpPayload) => void;
const otpHandlers: OtpHandler[] = [];

export const onOtpReceived = (handler: OtpHandler): void => {
  otpHandlers.push(handler);
};

export const startOtpSubscriber = async (): Promise<void> => {
  const client = getClient();

  if (!client) {
    console.warn("⚠️  [PUBSUB] Subscriber not started (mock mode)");
    return;
  }

  const subscription = client.subscription(OTP_SUBSCRIPTION);

  subscription.on("message", (message: Message) => {
    try {
      const payload: OtpPayload = JSON.parse(message.data.toString());
      console.log(`📥 [PUBSUB] OTP received for plan ${payload.planId}`);
      otpHandlers.forEach((handler) => handler(payload));
      message.ack();
    } catch (err) {
      console.error("❌ [PUBSUB] Failed to parse message:", err);
      message.nack();
    }
  });

  subscription.on("error", (err) => {
    console.error("❌ [PUBSUB] Subscription error:", err.message);
  });

  console.log(`✅ [PUBSUB] Subscriber active — Listening on ${OTP_SUBSCRIPTION}`);
};

// ---------------------------------------------------------------------------
// Mock broadcast (development fallback)
// ---------------------------------------------------------------------------
import { EventEmitter } from "events";
export const mockOtpEmitter = new EventEmitter();

const mockOtpBroadcast = (payload: OtpPayload): void => {
  console.log(`🔧 [PUBSUB MOCK] Broadcasting OTP: ${payload.otp} for plan ${payload.planId}`);
  mockOtpEmitter.emit("otp", payload);
  // Also trigger registered handlers
  otpHandlers.forEach((handler) => handler(payload));
};

// ---------------------------------------------------------------------------
// Webhook receiver — receives OTP from host's device via HTTP POST
// ---------------------------------------------------------------------------
/**
 * This endpoint is called by a mobile app or browser extension on the host's
 * device when it detects an OTP SMS/email. It then relays it via Pub/Sub.
 *
 * Usage: POST /api/otp/relay
 * Body: { planId, otp, service }
 */
export const receiveOtpWebhook = async (payload: {
  planId: string;
  otp: string;
  service?: string;
  secret?: string;
}): Promise<void> => {
  // Verify shared secret
  const expectedSecret = process.env.OTP_RELAY_SECRET;
  if (expectedSecret && payload.secret !== expectedSecret) {
    throw new Error("Invalid OTP relay secret");
  }

  await publishOtp({
    planId: payload.planId,
    otp: payload.otp,
    service: payload.service,
    source: "webhook",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
  });
};
