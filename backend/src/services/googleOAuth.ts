/**
 * Google OAuth 2.0 Strategy (Passport.js)
 * Handles "Sign in with Google" flow — finds or creates user,
 * always syncs the latest Google profile photo.
 */

import dotenv from "dotenv";
dotenv.config(); // Must load BEFORE reading process.env

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

// Only register the Google strategy if credentials are configured
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET &&
    GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE") {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const avatarUrl = profile.photos?.[0]?.value || null;
          const name = profile.displayName || email?.split("@")[0] || "User";
          const googleId = profile.id;

          if (!email) {
            return done(new Error("No email returned from Google"), undefined);
          }

          // Try to find existing user by googleId first, then by email
          let user = await prisma.user.findFirst({
            where: { OR: [{ googleId }, { email }] },
          });

          if (user) {
            // Update Google ID and avatar if changed
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                avatarUrl,          // Always sync latest Google photo
                lastLoginAt: new Date(),
              },
            });
          } else {
            // Create new user via Google OAuth
            user = await prisma.user.create({
              data: {
                name,
                email,
                googleId,
                avatarUrl,
                role: "HOST",        // default role; user can change later
                verificationStatus: "VERIFIED", // Google accounts are pre-verified
              },
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error, undefined);
        }
      }
    )
  );
  console.log("✅ [OAuth] Google strategy registered");
} else {
  console.warn("⚠️  [OAuth] GOOGLE_CLIENT_ID not set — Google login disabled. Add it to .env to enable.");
}

export default passport;

