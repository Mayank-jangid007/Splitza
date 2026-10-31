import { Router } from "express";
import passport from "../services/googleOAuth";
import {
  register,
  login,
  verifyOtpHandler,
  refreshToken,
  resendOtp,
  logout,
  getMe,
} from "../controllers/auth";
import { googleCallback } from "../controllers/googleAuth";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtpHandler);
router.post("/resend-otp", resendOtp);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: Redirect user to Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Step 2: Google redirects back here with code
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_failed` }),
  googleCallback
);

export default router;

