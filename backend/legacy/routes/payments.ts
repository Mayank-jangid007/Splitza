import { Router } from "express";
import {
  createMandate,
  requestRelease,
  getPaymentHistory,
  getHostEarnings,
  handleWebhook,
} from "../controllers/payments";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// Webhook (no auth — verified by signature in Phase 3)
router.post("/webhook", handleWebhook);

// Authenticated routes
router.get("/history", authenticate, getPaymentHistory);
router.get("/host-earnings", authenticate, requireRole("HOST"), getHostEarnings);
router.post("/mandate", authenticate, createMandate);
router.post("/release/:slotId", authenticate, requireRole("HOST"), requestRelease);

export default router;
