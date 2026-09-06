// =============================================================
//  Splitza — marketplace.service.ts
//  Discovery engine: public pool listings with strict
//  visibility enforcement and flexible filter/pagination.
// =============================================================

import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { PoolServiceError } from "../services/createPool.service";

// ─────────────────────────────────────────────
//  Query Input Contract
// ─────────────────────────────────────────────

export interface MarketplaceQueryInput {
  /** Free-text search against platform name or host name */
  search?: string;
  /** Filter by specific platform config slug e.g. "netflix-premium-4k" */
  platformSlug?: string;
  /** Price per seat range (INR) */
  minPricePerSeat?: number;
  maxPricePerSeat?: number;
  /** Only return pools that still have available seats */
  hasOpenSeats?: boolean;
  /** Plan term in months */
  planMonths?: number;
  /** Pagination */
  page?: number;
  pageSize?: number;
  /** Sort field */
  sortBy?: "priceAsc" | "priceDesc" | "newest" | "fillRate";
}

// ─────────────────────────────────────────────
//  Response Shape
// ─────────────────────────────────────────────

export interface MarketplacePoolItem {
  id: string;
  platformName: string;
  platformSlug: string | null;
  platformLogoUrl: string | null;
  tier: string | null;
  hostName: string;
  hostTrustScore: number;
  pricePerSeat: number;          // per member per month
  maxSeats: number;
  filledSeats: number;
  openSeats: number;
  fillPercent: number;
  planMonths: number;
  currency: string;
  isCustom: boolean;
  status: string;
  createdAt: Date;
}

export interface MarketplaceResult {
  items: MarketplacePoolItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

/** Statuses that indicate a pool is accepting new members */
const JOINABLE_STATUSES = ["OPEN"] as const;

const DEFAULT_PAGE      = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE     = 50;

// ─────────────────────────────────────────────
//  Discovery Query
// ─────────────────────────────────────────────

/**
 * getMarketplacePools
 *
 * Returns only PUBLIC + OPEN pools. PRIVATE pools are
 * NEVER included — the filter is enforced at query level,
 * not application level, so there is zero risk of leakage
 * through pagination edge cases or cursor drift.
 */
export async function getMarketplacePools(
  input: MarketplaceQueryInput
): Promise<MarketplaceResult> {

  const page     = Math.max(1, input.page     ?? DEFAULT_PAGE);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE));
  const skip     = (page - 1) * pageSize;

  // ── Build the where clause ───────────────────────────────────
  const where: Prisma.SplitPoolWhereInput = {
    // CRITICAL: These two conditions are always AND-ed, never OR-ed.
    // No code path can surface a PRIVATE pool here.
    visibility: "PUBLIC",
    status: { in: JOINABLE_STATUSES },

    // Platform filter
    ...(input.platformSlug && {
      platformConfig: { slug: input.platformSlug },
    }),

    // Price range filter
    ...((input.minPricePerSeat !== undefined || input.maxPricePerSeat !== undefined) && {
      pricePerSeat: {
        ...(input.minPricePerSeat !== undefined && {
          gte: new Prisma.Decimal(input.minPricePerSeat),
        }),
        ...(input.maxPricePerSeat !== undefined && {
          lte: new Prisma.Decimal(input.maxPricePerSeat),
        }),
      },
    }),

    // Plan month filter
    ...(input.planMonths && { planMonths: input.planMonths }),

    // Free-text search: platform name OR host name
    ...(input.search?.trim() && {
      OR: [
        {
          platformConfig: {
            name: { contains: input.search.trim(), mode: "insensitive" },
          },
        },
        {
          customName: { contains: input.search.trim(), mode: "insensitive" },
        },
        {
          host: { name: { contains: input.search.trim(), mode: "insensitive" } },
        },
      ],
    }),
  };

  // ── Sort order ───────────────────────────────────────────────
  const orderBy: Prisma.SplitPoolOrderByWithRelationInput = (() => {
    switch (input.sortBy) {
      case "priceAsc":  return { pricePerSeat: "asc"  };
      case "priceDesc": return { pricePerSeat: "desc" };
      case "newest":    return { createdAt:    "desc" };
      case "fillRate":  // desc fill rate = nearly-full pools first (urgency)
        return { memberships: { _count: "desc" } };
      default:          return { createdAt: "desc" };
    }
  })();

  // ── Execute count + data in parallel ────────────────────────
  const [total, rows] = await Promise.all([
    prisma.splitPool.count({ where }),
    prisma.splitPool.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id:             true,
        customName:     true,
        isCustom:       true,
        pricePerSeat:   true,
        maxSeats:       true,
        planMonths:     true,
        currency:       true,
        status:         true,
        createdAt:      true,
        host: {
          select: {
            name:       true,
            trustScore: true,
          },
        },
        platformConfig: {
          select: {
            name:    true,
            slug:    true,
            logoUrl: true,
            tier:    true,
          },
        },
        // Count only active/pending memberships for accurate fill number
        _count: {
          select: {
            memberships: {
              where: {
                status: { in: ["ACTIVE", "PENDING_PAYMENT"] },
              },
            },
          },
        },
      },
    }),
  ]);

  // ── Shape the response ───────────────────────────────────────
  const items: MarketplacePoolItem[] = rows.map((row) => {
    const filledSeats = row._count.memberships;
    const openSeats   = Math.max(0, row.maxSeats - filledSeats);
    const fillPercent = Math.round((filledSeats / row.maxSeats) * 100);

    // Optional: skip pools with no open seats when filter requested
    if (input.hasOpenSeats && openSeats === 0) return null;

    return {
      id:              row.id,
      platformName:    row.isCustom
        ? (row.customName ?? "Custom Plan")
        : (row.platformConfig?.name ?? "Unknown"),
      platformSlug:    row.platformConfig?.slug   ?? null,
      platformLogoUrl: row.platformConfig?.logoUrl ?? null,
      tier:            row.platformConfig?.tier    ?? null,
      hostName:        row.host.name,
      hostTrustScore:  row.host.trustScore,
      pricePerSeat:    Number(row.pricePerSeat),
      maxSeats:        row.maxSeats,
      filledSeats,
      openSeats,
      fillPercent,
      planMonths:      row.planMonths,
      currency:        row.currency,
      isCustom:        row.isCustom,
      status:          row.status,
      createdAt:       row.createdAt,
    };
  }).filter(Boolean) as MarketplacePoolItem[];

  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}

// ─────────────────────────────────────────────
//  Single Pool via Private Token
// ─────────────────────────────────────────────

/**
 * getPrivatePoolByToken
 *
 * The ONLY gateway to view a PRIVATE pool. A valid, non-expired,
 * non-revoked invite token is required. Returns null if not found
 * rather than exposing pool existence via error message.
 */
export async function getPrivatePoolByToken(
  token: string
): Promise<MarketplacePoolItem | null> {

  if (!token?.trim()) return null;

  const link = await prisma.inviteLink.findUnique({
    where: { token },
    include: {
      pool: {
        include: {
          host:           { select: { name: true, trustScore: true } },
          platformConfig: { select: { name: true, slug: true, logoUrl: true, tier: true } },
          _count: {
            select: {
              memberships: {
                where: { status: { in: ["ACTIVE", "PENDING_PAYMENT"] } },
              },
            },
          },
        },
      },
    },
  });

  // Strict token validation guards
  if (!link)                            return null;  // token not found
  if (link.isRevoked)                   return null;  // revoked
  if (link.expiresAt && link.expiresAt < new Date()) return null;  // expired
  if (link.maxUses && link.useCount >= link.maxUses) return null;  // exhausted

  const { pool } = link;
  const filledSeats = pool._count.memberships;
  const openSeats   = Math.max(0, pool.maxSeats - filledSeats);

  return {
    id:              pool.id,
    platformName:    pool.isCustom
      ? (pool.customName ?? "Custom Plan")
      : (pool.platformConfig?.name ?? "Unknown"),
    platformSlug:    pool.platformConfig?.slug    ?? null,
    platformLogoUrl: pool.platformConfig?.logoUrl ?? null,
    tier:            pool.platformConfig?.tier    ?? null,
    hostName:        pool.host.name,
    hostTrustScore:  pool.host.trustScore,
    pricePerSeat:    Number(pool.pricePerSeat),
    maxSeats:        pool.maxSeats,
    filledSeats,
    openSeats,
    fillPercent:     Math.round((filledSeats / pool.maxSeats) * 100),
    planMonths:      pool.planMonths,
    currency:        pool.currency,
    isCustom:        pool.isCustom,
    status:          pool.status,
    createdAt:       pool.createdAt,
  };
}
