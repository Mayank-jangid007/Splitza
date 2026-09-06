// =============================================================
//  Splitza — createPool.service.ts
//  Core service for creating a new subscription split pool.
//
//  Responsibilities:
//   1. Input validation & GlobalPlatformConfig enforcement
//   2. Per-seat price calculation
//   3. Invite token generation for private pools
//   4. Atomic DB transaction: SplitPool + Membership + PoolCredential
// =============================================================

import { randomBytes } from "crypto";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../lib/prisma";
import type {
  IGlobalPlatformConfig,
  IMembership,
  IPoolCredential,
  ISplitPool,
} from "../types/db.types";

// ─────────────────────────────────────────────
//  Service-level Error
// ─────────────────────────────────────────────

export class PoolServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusHint: 400 | 403 | 404 | 409 | 500 = 400
  ) {
    super(message);
    this.name = "PoolServiceError";
  }
}

// ─────────────────────────────────────────────
//  Input Contracts
// ─────────────────────────────────────────────

interface BasePoolInput {
  hostId: string;
  visibility: "PUBLIC" | "PRIVATE";
  hostUpiId: string;
  /** Plaintext credentials — encrypted before persisting */
  credentials?: {
    username?: string;
    password?: string;
    inviteLink?: string;
  };
}

interface PreStoredPoolInput extends BasePoolInput {
  serviceType: "PRE_STORED";
  platformConfigId: string;
  /** Values supplied by the client — validated against GlobalPlatformConfig */
  claimedPlanMonths: number;
  claimedMaxSeats: number;
  claimedTotalCostINR: number;
}

interface CustomPoolInput extends BasePoolInput {
  serviceType: "CUSTOM";
  customName: string;
  totalPlanCostINR: number;
  totalSeats: number;
  planMonths: number;
}

export type CreatePoolInput = PreStoredPoolInput | CustomPoolInput;

// ─────────────────────────────────────────────
//  Output Contract
// ─────────────────────────────────────────────

export interface CreatePoolResult {
  pool: ISplitPool;
  hostMembership: IMembership;
  credential: IPoolCredential | null;
  inviteToken: string | null;
}

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

const PLATFORM_FEE_PERCENT = new Decimal(5); // 5 %
const INVITE_TOKEN_BYTES   = 32;             // 256-bit token → 64 hex chars
const MAX_CUSTOM_SEATS     = 12;
const MAX_PLAN_MONTHS      = 12;
const MIN_PRICE_INR        = 1;

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/**
 * Generate a cryptographically secure URL-safe token.
 * Uses Node's crypto.randomBytes — runs on the server only.
 */
function generateSecureToken(): string {
  return randomBytes(INVITE_TOKEN_BYTES).toString("hex");
}

/**
 * Naive AES-256-GCM envelope — replace with your KMS client in production.
 * Returns { ciphertext, iv, keyId } all as base64 strings.
 */
async function encryptField(
  plaintext: string
): Promise<{ ciphertext: string; iv: string; keyId: string }> {
  const { createCipheriv } = await import("crypto");

  // In production: fetch key bytes from AWS KMS / GCP KMS / Vault
  const key = Buffer.from(process.env.CREDENTIAL_ENCRYPTION_KEY!, "hex"); // 32-byte hex key
  const iv  = randomBytes(16);

  const cipher     = createCipheriv("aes-256-gcm", key, iv);
  const encrypted  = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag    = cipher.getAuthTag();

  return {
    ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
    keyId: process.env.CREDENTIAL_KEY_ID ?? "local-dev-key-v1",
  };
}

/** Round a Decimal to 2 decimal places and return as Decimal */
function toDecimal(value: number): Decimal {
  return new Decimal(value).toDecimalPlaces(2);
}

// ─────────────────────────────────────────────
//  Validation Helpers
// ─────────────────────────────────────────────

function validateBaseInput(input: BasePoolInput): void {
  if (!input.hostId?.trim()) {
    throw new PoolServiceError("MISSING_HOST_ID", "hostId is required.");
  }
  if (!input.hostUpiId?.trim()) {
    throw new PoolServiceError("MISSING_UPI", "hostUpiId is required for payouts.");
  }
  // Basic UPI ID format check: something@something
  if (!/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(input.hostUpiId)) {
    throw new PoolServiceError("INVALID_UPI", `'${input.hostUpiId}' is not a valid UPI ID.`);
  }
  if (!["PUBLIC", "PRIVATE"].includes(input.visibility)) {
    throw new PoolServiceError("INVALID_VISIBILITY", "visibility must be PUBLIC or PRIVATE.");
  }
}

async function fetchAndValidatePlatformConfig(
  input: PreStoredPoolInput
): Promise<{
  config: IGlobalPlatformConfig;
  lockedMaxSeats: number;
  lockedPricePerMonth: Decimal;
  lockedPlanMonths: number;
}> {
  const raw = await prisma.globalPlatformConfig.findUnique({
    where: { id: input.platformConfigId },
  });

  if (!raw) {
    throw new PoolServiceError(
      "PLATFORM_CONFIG_NOT_FOUND",
      `No GlobalPlatformConfig found with id '${input.platformConfigId}'.`,
      404
    );
  }
  if (!raw.isActive) {
    throw new PoolServiceError(
      "PLATFORM_CONFIG_INACTIVE",
      `Platform '${raw.name}' is currently not accepting new pools.`,
      403
    );
  }

  // Cast Prisma Decimal to Decimal for arithmetic
  const officialPricePerMonth = new Decimal(raw.pricePerMonth.toString());

  // ── Seat guard ──────────────────────────────────────────────
  if (input.claimedMaxSeats !== raw.maxSeats) {
    throw new PoolServiceError(
      "SEAT_COUNT_TAMPERED",
      `${raw.name} allows exactly ${raw.maxSeats} seats. ` +
        `Client submitted ${input.claimedMaxSeats}.`
    );
  }

  // ── Billing cycle guard ──────────────────────────────────────
  if (!raw.allowedCycles.includes(input.claimedPlanMonths)) {
    throw new PoolServiceError(
      "INVALID_BILLING_CYCLE",
      `${raw.name} does not allow a ${input.claimedPlanMonths}-month plan. ` +
        `Allowed: [${raw.allowedCycles.join(", ")}].`
    );
  }

  // ── Total price guard ────────────────────────────────────────
  const expectedTotal = officialPricePerMonth
    .times(input.claimedPlanMonths)
    .toDecimalPlaces(2);
  const claimedTotal  = toDecimal(input.claimedTotalCostINR);

  if (!claimedTotal.equals(expectedTotal)) {
    throw new PoolServiceError(
      "PRICE_TAMPERED",
      `${raw.name} total for ${input.claimedPlanMonths} month(s) must be ` +
        `₹${expectedTotal.toFixed(2)}. Client submitted ₹${claimedTotal.toFixed(2)}.`
    );
  }

  return {
    config: raw as unknown as IGlobalPlatformConfig,
    lockedMaxSeats: raw.maxSeats,
    lockedPricePerMonth: officialPricePerMonth,
    lockedPlanMonths: input.claimedPlanMonths,
  };
}

function validateCustomInput(input: CustomPoolInput): void {
  if (!input.customName?.trim()) {
    throw new PoolServiceError("MISSING_NAME", "customName is required for custom pools.");
  }
  if (input.totalPlanCostINR < MIN_PRICE_INR) {
    throw new PoolServiceError(
      "INVALID_PRICE",
      `totalPlanCostINR must be at least ₹${MIN_PRICE_INR}.`
    );
  }
  if (!Number.isInteger(input.totalSeats) || input.totalSeats < 2) {
    throw new PoolServiceError("INVALID_SEATS", "totalSeats must be an integer ≥ 2.");
  }
  if (input.totalSeats > MAX_CUSTOM_SEATS) {
    throw new PoolServiceError(
      "TOO_MANY_SEATS",
      `Custom pools may not exceed ${MAX_CUSTOM_SEATS} seats.`
    );
  }
  if (!Number.isInteger(input.planMonths) || input.planMonths < 1) {
    throw new PoolServiceError("INVALID_MONTHS", "planMonths must be an integer ≥ 1.");
  }
  if (input.planMonths > MAX_PLAN_MONTHS) {
    throw new PoolServiceError(
      "PLAN_TOO_LONG",
      `planMonths cannot exceed ${MAX_PLAN_MONTHS}.`
    );
  }
}

// ─────────────────────────────────────────────
//  Credential Encryption Helper
// ─────────────────────────────────────────────

async function buildCredentialPayload(
  poolId: string,
  creds: BasePoolInput["credentials"]
): Promise<Parameters<typeof prisma.poolCredential.create>[0]["data"] | null> {
  if (!creds || (!creds.username && !creds.password && !creds.inviteLink)) {
    return null;
  }

  // Encrypt each provided field independently; they share the same IV batch
  let encryptedUsername: string | undefined;
  let encryptedPassword: string | undefined;
  let encryptedInviteLink: string | undefined;
  let sharedIv = "";
  let sharedKeyId = "";

  if (creds.username) {
    const enc = await encryptField(creds.username);
    encryptedUsername = enc.ciphertext;
    sharedIv    = enc.iv;
    sharedKeyId = enc.keyId;
  }
  if (creds.password) {
    const enc = await encryptField(creds.password);
    encryptedPassword = enc.ciphertext;
    if (!sharedIv) { sharedIv = enc.iv; sharedKeyId = enc.keyId; }
  }
  if (creds.inviteLink) {
    const enc = await encryptField(creds.inviteLink);
    encryptedInviteLink = enc.ciphertext;
    if (!sharedIv) { sharedIv = enc.iv; sharedKeyId = enc.keyId; }
  }

  return {
    poolId,
    encryptedUsername:   encryptedUsername  ?? null,
    encryptedPassword:   encryptedPassword  ?? null,
    encryptedInviteLink: encryptedInviteLink ?? null,
    iv:             sharedIv,
    encryptionKeyId: sharedKeyId,
  };
}

// ─────────────────────────────────────────────
//  Main Service Function
// ─────────────────────────────────────────────

/**
 * createPool
 *
 * Creates a new SplitPool atomically. Handles both PRE_STORED and CUSTOM
 * service types with strict server-side enforcement.
 *
 * @throws {PoolServiceError} on validation or business rule failure
 */
export async function createPool(
  input: CreatePoolInput
): Promise<CreatePoolResult> {

  // ── 1. Base validation ───────────────────────────────────────
  validateBaseInput(input);

  // ── 2. Resolve plan parameters ───────────────────────────────
  let maxSeats:     number;
  let planMonths:   number;
  let totalCostINR: Decimal;
  let platformConfigId: string | null  = null;
  let customName:        string | null = null;
  let isCustom = false;

  if (input.serviceType === "PRE_STORED") {
    const { lockedMaxSeats, lockedPricePerMonth, lockedPlanMonths, config } =
      await fetchAndValidatePlatformConfig(input);

    maxSeats         = lockedMaxSeats;
    planMonths       = lockedPlanMonths;
    totalCostINR     = lockedPricePerMonth.times(lockedPlanMonths).toDecimalPlaces(2);
    platformConfigId = config.id;
  } else {
    validateCustomInput(input);
    maxSeats     = input.totalSeats;
    planMonths   = input.planMonths;
    totalCostINR = toDecimal(input.totalPlanCostINR);
    customName   = input.customName.trim();
    isCustom     = true;
  }

  // ── 3. Per-seat arithmetic ───────────────────────────────────
  // Price per seat = totalCost / maxSeats, rounded up to nearest paisa
  const pricePerSeat: Decimal = totalCostINR
    .dividedBy(maxSeats)
    .toDecimalPlaces(2, Decimal.ROUND_CEIL);

  // ── 4. Visibility & invite token ─────────────────────────────
  const inviteToken: string | null =
    input.visibility === "PRIVATE" ? generateSecureToken() : null;

  // ── 5. Guard: host must exist & be active ───────────────────
  const host = await prisma.user.findUnique({
    where: { id: input.hostId },
    select: { id: true, isActive: true, verificationStatus: true },
  });
  if (!host) {
    throw new PoolServiceError("HOST_NOT_FOUND", "Host user not found.", 404);
  }
  if (!host.isActive) {
    throw new PoolServiceError(
      "HOST_INACTIVE",
      "Host account is deactivated.",
      403
    );
  }

  // ── 6. Atomic transaction ────────────────────────────────────
  const [createdPool, hostMembership, credential] = await prisma.$transaction(
    async (tx) => {

      // 6a. Create the SplitPool
      const pool = await tx.splitPool.create({
        data: {
          hostId:             input.hostId,
          platformConfigId,
          customName,
          customPricePerMonth: isCustom
            ? totalCostINR.dividedBy(planMonths).toDecimalPlaces(2)
            : null,
          customMaxSeats: isCustom ? maxSeats : null,
          isCustom,
          maxSeats,
          pricePerSeat,
          planMonths,
          currency:           "INR",
          visibility:         input.visibility,
          status:             "OPEN",
          hostUpiId:          input.hostUpiId.trim(),
          platformFeePercent: PLATFORM_FEE_PERCENT,
          autoRenew:          false,
        },
      });

      // 6b. Add host as first membership (seat 1 of N, role = HOST)
      const membership = await tx.membership.create({
        data: {
          userId:          input.hostId,
          poolId:          pool.id,
          role:            "HOST",
          status:          "ACTIVE",  // host is active immediately
          priceAtJoin:     pricePerSeat,
          planMonthsAtJoin: planMonths,
        },
      });

      // 6c. If a private pool → persist the invite link record
      if (inviteToken) {
        await tx.inviteLink.create({
          data: {
            poolId:      pool.id,
            token:       inviteToken,
            createdById: input.hostId,
            maxUses:     maxSeats - 1, // one slot per remaining member
            expiresAt:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });
      }

      // 6d. Encrypt & persist credentials if provided
      const credData = await buildCredentialPayload(pool.id, input.credentials);
      let savedCredential = null;
      if (credData) {
        savedCredential = await tx.poolCredential.create({ data: credData });
      }

      return [pool, membership, savedCredential] as const;
    },
    {
      isolationLevel: "Serializable", // prevent race on seat count
      timeout:        8000,           // 8-second transaction timeout
    }
  );

  // ── 7. Audit log (outside transaction — non-critical) ────────
  await prisma.auditLog.create({
    data: {
      actorId:  input.hostId,
      action:   "POOL_CREATED",
      entity:   "SplitPool",
      entityId: createdPool.id,
      metadata: {
        serviceType:  input.serviceType,
        visibility:   input.visibility,
        maxSeats,
        planMonths,
        pricePerSeat: pricePerSeat.toFixed(2),
      },
    },
  }).catch((err) => {
    // Audit failure must never crash the main flow
    console.error("[AuditLog] Failed to write POOL_CREATED:", err);
  });

  // ── 8. Return result ─────────────────────────────────────────
  return {
    pool:           createdPool   as unknown as ISplitPool,
    hostMembership: hostMembership as unknown as IMembership,
    credential:     credential    as unknown as IPoolCredential | null,
    inviteToken,    // ONLY returned here — never stored in plaintext again
  };
}
