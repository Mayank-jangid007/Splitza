// =============================================================
//  Splitza — marketplace.controller.ts
//  HTTP adapter for the marketplace discovery engine.
// =============================================================

import type { Request, Response } from "express";
import {
  getMarketplacePools,
  getPrivatePoolByToken,
  type MarketplaceQueryInput,
} from "../services/marketplace.service";

// ─────────────────────────────────────────────
//  GET /api/marketplace/pools
// ─────────────────────────────────────────────

export async function handleGetMarketplacePools(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      search,
      platformSlug,
      minPricePerSeat,
      maxPricePerSeat,
      hasOpenSeats,
      planMonths,
      page,
      pageSize,
      sortBy,
    } = req.query;

    const input: MarketplaceQueryInput = {
      search: search ? String(search) : undefined,
      platformSlug: platformSlug ? String(platformSlug) : undefined,
      minPricePerSeat: minPricePerSeat ? Number(minPricePerSeat) : undefined,
      maxPricePerSeat: maxPricePerSeat ? Number(maxPricePerSeat) : undefined,
      hasOpenSeats: hasOpenSeats === "true",
      planMonths: planMonths ? Number(planMonths) : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sortBy: sortBy as MarketplaceQueryInput["sortBy"],
    };

    const result = await getMarketplacePools(input);

    res.status(200).json({
      ok: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (err) {
    console.error("[GET /api/marketplace/pools] Unhandled error:", err);
    res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred while fetching marketplace pools.",
    });
  }
}

// ─────────────────────────────────────────────
//  GET /api/marketplace/pools/private/:token
// ─────────────────────────────────────────────

export async function handleGetPrivatePool(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        ok: false,
        code: "MISSING_TOKEN",
        message: "Invite token is required.",
      });
      return;
    }

    const pool = await getPrivatePoolByToken(token);

    if (!pool) {
      // Return a generic 404 to avoid leaking valid vs invalid tokens
      res.status(404).json({
        ok: false,
        code: "POOL_NOT_FOUND",
        message: "This private pool does not exist, or the invite link has expired/revoked.",
      });
      return;
    }

    res.status(200).json({
      ok: true,
      data: pool,
    });
  } catch (err) {
    console.error("[GET /api/marketplace/pools/private/:token] Unhandled error:", err);
    res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred while fetching the private pool.",
    });
  }
}
