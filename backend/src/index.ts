import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import passport from "./services/googleOAuth";

import authRoutes from "./routes/auth";
import poolsRoutes from "./routes/pools";
import marketplaceRoutes from "./routes/marketplace";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";

dotenv.config();


const app = express();
app.set("trust proxy", 1);
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
app.use(passport.initialize());

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
    message: "Splitza API",
    endpoints: {
      auth: "/api/auth/*",
      pools: "/api/pools/*",
      marketplace: "/api/marketplace/*",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/pools", poolsRoutes);
app.use("/api/marketplace", marketplaceRoutes);

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// HTTP Server
// ---------------------------------------------------------------------------
const httpServer = http.createServer(app);

// Handle bind errors (e.g. a second instance trying to use the same port)
// gracefully instead of crashing with an unhandled 'error' event.
const handleServerError = (err: NodeJS.ErrnoException): void => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use. Is another Splitza API instance running?`
    );
  } else {
    console.error("❌ HTTP server error:", err);
  }
  process.exit(1);
};
httpServer.on("error", handleServerError);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const startServer = async () => {
  // Listen immediately so the API and /health are reachable while the
  // database warms up (Neon/serverless DBs can take ~20s on cold start).
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Splitza API v3.0 running at http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Frontend    : ${FRONTEND_URL}`);
    console.log(`   Health      : http://localhost:${PORT}/health\n`);
  });

  // Warm up the connection in the background. Prisma reconnects lazily on
  // the next query, so the server stays usable even if this first attempt fails.
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected via Prisma");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    if (process.env.NODE_ENV === "production") {
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
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
