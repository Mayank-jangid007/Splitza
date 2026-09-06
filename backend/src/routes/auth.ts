import { Router } from "express";
import {
  register,
  login,
  verifyOtpHandler,
  refreshToken,
  resendOtp,
  logout,
  getMe,
} from "../controllers/auth";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtpHandler);
router.post("/resend-otp", resendOtp);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;
