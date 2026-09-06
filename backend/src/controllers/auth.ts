import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../services/jwt";
import { generateOtp, verifyOtp, sendOtp } from "../services/otp";
import { AuthRequest } from "../middleware/auth";

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, password, role = "MEMBER" } = req.body;

    if (!name || !email || !password) {
      throw new AppError("Name, email and password are required", 400);
    }

    if (!["HOST", "MEMBER"].includes(role)) {
      throw new AppError("Role must be HOST or MEMBER", 400);
    }

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      throw new AppError("An account with this email or phone already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: hashedPassword,
        role,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    // Generate and send OTP — always use email as identifier for consistency
    const identifier = email;
    const otp = generateOtp(identifier);
    await sendOtp(user.id, identifier, otp);

    res.status(201).json({
      success: true,
      message: "Account created. OTP sent for verification.",
      data: {
        user,
        otpSentTo: identifier,
        // In development, return OTP directly so you don't need SMS/email set up
        ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/verify-otp
// ---------------------------------------------------------------------------
export const verifyOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) throw new AppError("Identifier and OTP are required", 400);

    verifyOtp(identifier, otp); // throws on failure

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) throw new AppError("User not found", 404);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError("Email and password are required", 400);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) throw new AppError("Invalid email or password", 401);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) throw new AppError("Refresh token required", 401);

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) throw new AppError("User not found", 404);

    const newAccessToken = generateAccessToken(user.id);
    res.json({ success: true, data: { accessToken: newAccessToken, user } });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/resend-otp
// ---------------------------------------------------------------------------
export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { identifier } = req.body;
    if (!identifier) throw new AppError("Identifier (email or phone) is required", 400);

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) throw new AppError("No account found with this identifier", 404);

    const otp = generateOtp(identifier);
    await sendOtp(user.id, identifier, otp);

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("refresh_token");
  res.json({ success: true, message: "Logged out successfully" });
};

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, avatarUrl: true, trustScore: true, createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};
