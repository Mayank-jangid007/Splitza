import { Router } from "express";
import { relayOtp, simulateOtp, getOtpStatus } from "../controllers/otp";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public webhook endpoint (secured via shared secret, not JWT)
router.post("/relay", relayOtp);

// Authenticated endpoints
router.post("/simulate", authenticate, simulateOtp);
router.get("/status/:planId", authenticate, getOtpStatus);

export default router;
