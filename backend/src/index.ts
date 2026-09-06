import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import planRoutes from "./routes/plans";
import slotRoutes from "./routes/slots";
import paymentRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import otpRoutes from "./routes/otp";
import poolsRoutes from "./routes/pools";
import marketplaceRoutes from "./routes/marketplace";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";
import { initWebSocketServer } from "./services/websocket";
import { startOtpSubscriber } from "./services/pubsub";
import { closeBrowser } from "./services/bot";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ---------------------------------------------------------------------------
// Security & Parsing Middleware
// ---------------------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());

// Raw body parser for Razorpay webhook signature verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ---------------------------------------------------------------------------
// Rate Limiting
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "splitza-api",
      version: "3.0.0",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      service: "splitza-api",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api", (_req, res) => {
  res.json({
    message: "Splitza API v3.0 — Phase 3 Active",
    features: {
      payments: "Razorpay UPI AutoPay",
      verification: "Puppeteer Browser Bots",
      otpRelay: "Google Pub/Sub + WebSocket",
      escrow: "Razorpay Route",
    },
    endpoints: {
      auth: "/api/auth/*",
      plans: "/api/plans/*",
      slots: "/api/slots/*",
      payments: "/api/payments/*",
      otp: "/api/otp/*",
      admin: "/api/admin/*",
      websocket: "ws://host/ws?token=<jwt>",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pools", poolsRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// HTTP Server + WebSocket
// ---------------------------------------------------------------------------
const httpServer = http.createServer(app);
initWebSocketServer(httpServer);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected via Prisma");

    // Start Google Pub/Sub subscriber for OTP relay
    await startOtpSubscriber();

    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Splitza API v3.0 running at http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`   Frontend    : ${FRONTEND_URL}`);
      console.log(`   WebSocket   : ws://localhost:${PORT}/ws`);
      console.log(`   Health      : http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    if (process.env.NODE_ENV !== "production") {
      httpServer.listen(PORT, () => {
        console.log(`🚀 Splitza API (offline mode) at http://localhost:${PORT}`);
      });
    } else {
      process.exit(1);
    }
  }
};

startServer();

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await closeBrowser();
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
