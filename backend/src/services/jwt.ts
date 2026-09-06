import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";

export interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string =>
  jwt.sign({ userId } as TokenPayload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId } as TokenPayload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, REFRESH_SECRET) as TokenPayload;
