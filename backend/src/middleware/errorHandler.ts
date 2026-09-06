import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV === "development";

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // Prisma unique constraint
  if ((err as any).code === "P2002") {
    const field = (err as any).meta?.target?.[0] ?? "field";
    res.status(409).json({
      success: false,
      message: `A user with this ${field} already exists`,
    });
    return;
  }

  // Prisma not found
  if ((err as any).code === "P2025") {
    res.status(404).json({ success: false, message: "Resource not found" });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(isDev && { error: err.message, stack: err.stack }),
  });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: "Route not found" });
};
