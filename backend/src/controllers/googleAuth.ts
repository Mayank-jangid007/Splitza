/**
 * Google OAuth Controller
 * Handles the callback after Google authentication,
 * issues JWT tokens and redirects back to frontend.
 */

import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "../services/jwt";
import { User } from "@prisma/client";

// Called after passport successfully authenticates via Google
export const googleCallback = (req: Request, res: Response): void => {
  const user = req.user as User;

  if (!user) {
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=google_failed`);
    return;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Set refresh token as httpOnly cookie
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Pass accessToken + user to frontend via URL (or use a short-lived code)
  const userData = encodeURIComponent(
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      trustScore: user.trustScore,
    })
  );

  // Redirect to frontend with token — frontend will store it
  res.redirect(
    `${process.env.FRONTEND_URL}/auth/google/success?token=${accessToken}&user=${userData}`
  );
};
