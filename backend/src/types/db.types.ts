// =============================================================
//  Splitza — TypeScript Domain Interfaces & Input Types
//  Mirrors schema.prisma exactly. Use these for API handlers,
//  service layer, and DTOs — never expose raw Prisma models.
// =============================================================

// ─────────────────────────────────────────────
//  ENUMS
// ─────────────────────────────────────────────

export type UserRole = "MEMBER" | "HOST" | "ADMIN";

export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export type PoolVisibility = "PUBLIC" | "PRIVATE";

export type PoolStatus =
  | "DRAFT"
  | "OPEN"
  | "FULL"
  | "ACTIVE"
  | "PAUSED"
  | "ENDED"
  | "CANCELLED";

export type MembershipRole = "HOST" | "MEMBER";

export type MembershipStatus =
  | "INVITED"
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "PAUSED"
  | "REMOVED"
  | "LEFT"
  | "EXPIRED";

export type TransactionType =
  | "MEMBER_COLLECTION"
  | "HOST_DISBURSEMENT"
  | "PLATFORM_FEE"
  | "REFUND";

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED";

export type EscrowCycleStatus =
  | "SCHEDULED"
  | "COLLECTING"
  | "COLLECTED"
  | "DISBURSING"
  | "SETTLED"
  | "PARTIAL_FAIL"
  | "FAILED";

export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED_HOST_FAVOUR"
  | "RESOLVED_MEMBER_FAVOUR"
  | "CLOSED";

export type NotificationType =
  | "INVITE_RECEIVED"
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "PAYMENT_COLLECTED"
  | "PAYOUT_RELEASED"
  | "CREDENTIALS_UPDATED"
  | "PLAN_FULL"
  | "PLAN_ENDED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "OTP_RELAY"
  | "SYSTEM";

// ─────────────────────────────────────────────
//  USER
// ─────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  avatarUrl: string | null;
  passwordHash: string | null;
  googleId: string | null;
  role: UserRole;
  verificationStatus: VerificationStatus;
  upiId: string | null;
  trustScore: number;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserInput {
  email: string;
  name: string;
  phone?: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  upiId?: string;
  role?: UserRole;
}

export interface IUpdateUserInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  upiId?: string;
  verificationStatus?: VerificationStatus;
  isActive?: boolean;
  lastLoginAt?: Date;
}

/** Safe public shape — never include passwordHash or googleId */
export interface IPublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  trustScore: number;
  verificationStatus: VerificationStatus;
  createdAt: Date;
}

// ─────────────────────────────────────────────
//  GLOBAL PLATFORM CONFIG
// ─────────────────────────────────────────────

export interface IGlobalPlatformConfig {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  tier: string;
  maxSeats: number;
  pricePerMonth: number; // stored as Decimal, typed as number
  currency: string;
  allowedCycles: number[];
  isActive: boolean;
  description: string | null;
  websiteUrl: string | null;
  termsUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePlatformConfigInput {
  slug: string;
  name: string;
  tier: string;
  maxSeats: number;
  pricePerMonth: number;
  allowedCycles: number[];
  logoUrl?: string;
  currency?: string;
  description?: string;
  websiteUrl?: string;
  termsUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IUpdatePlatformConfigInput {
  name?: string;
  tier?: string;
  maxSeats?: number;
  pricePerMonth?: number;
  allowedCycles?: number[];
  logoUrl?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// ─────────────────────────────────────────────
//  SPLIT POOL
// ─────────────────────────────────────────────

export interface ISplitPool {
  id: string;
  hostId: string;
  platformConfigId: string | null;
  customName: string | null;
  customPricePerMonth: number | null;
  customMaxSeats: number | null;
  isCustom: boolean;
  maxSeats: number;
  pricePerSeat: number;
  planMonths: number;
  currency: string;
  visibility: PoolVisibility;
  status: PoolStatus;
  hostUpiId: string;
  platformFeePercent: number;
  startDate: Date | null;
  endDate: Date | null;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Input for creating an official (pre-stored platform) pool */
export interface ICreateOfficialPoolInput {
  hostId: string;
  platformConfigId: string;
  planMonths: number;
  visibility: PoolVisibility;
  hostUpiId: string;
}

/** Input for creating a fully custom pool */
export interface ICreateCustomPoolInput {
  hostId: string;
  customName: string;
  customPricePerMonth: number;
  customMaxSeats: number;
  planMonths: number;
  visibility: PoolVisibility;
  hostUpiId: string;
}

export type ICreatePoolInput = ICreateOfficialPoolInput | ICreateCustomPoolInput;

export interface IUpdatePoolInput {
  visibility?: PoolVisibility;
  status?: PoolStatus;
  autoRenew?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/** Pool shape returned to clients — includes derived computed fields */
export interface IPoolSummary extends ISplitPool {
  filledSeats: number;
  openSeats: number;
  fillPercent: number;
  host: IPublicUser;
  platformConfig: IGlobalPlatformConfig | null;
}

// ─────────────────────────────────────────────
//  POOL CREDENTIAL
// ─────────────────────────────────────────────

export interface IPoolCredential {
  id: string;
  poolId: string;
  // All fields are ciphertext — never returned raw to clients
  encryptedUsername: string | null;
  encryptedPassword: string | null;
  encryptedInviteLink: string | null;
  encryptionKeyId: string;
  iv: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISetCredentialInput {
  poolId: string;
  username?: string;    // plaintext — service layer encrypts before persisting
  password?: string;
  inviteLink?: string;
}

// ─────────────────────────────────────────────
//  MEMBERSHIP
// ─────────────────────────────────────────────

export interface IMembership {
  id: string;
  userId: string;
  poolId: string;
  role: MembershipRole;
  status: MembershipStatus;
  priceAtJoin: number;
  planMonthsAtJoin: number;
  mandateId: string | null;
  mandateStatus: string | null;
  mandateCreatedAt: Date | null;
  joinedAt: Date;
  leftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMembershipInput {
  userId: string;
  poolId: string;
  role?: MembershipRole;
  priceAtJoin: number;
  planMonthsAtJoin: number;
}

export interface IUpdateMembershipInput {
  status?: MembershipStatus;
  mandateId?: string;
  mandateStatus?: string;
  mandateCreatedAt?: Date;
  leftAt?: Date;
}

// ─────────────────────────────────────────────
//  INVITE LINK
// ─────────────────────────────────────────────

export interface IInviteLink {
  id: string;
  token: string;
  poolId: string;
  createdById: string;
  maxUses: number | null;
  useCount: number;
  expiresAt: Date | null;
  isRevoked: boolean;
  createdAt: Date;
}

export interface ICreateInviteLinkInput {
  poolId: string;
  createdById: string;
  maxUses?: number;
  expiresAt?: Date;
}

// ─────────────────────────────────────────────
//  ESCROW CYCLE
// ─────────────────────────────────────────────

export interface IEscrowCycle {
  id: string;
  poolId: string;
  cycleNumber: number;
  status: EscrowCycleStatus;
  totalExpected: number;
  totalCollected: number;
  platformFee: number;
  hostDisbursement: number;
  collectionStartAt: Date | null;
  collectionEndAt: Date | null;
  disbursedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEscrowCycleInput {
  poolId: string;
  cycleNumber: number;
  totalExpected: number;
  collectionStartAt?: Date;
}

export interface ISettleEscrowCycleInput {
  totalCollected: number;
  platformFee: number;
  hostDisbursement: number;
  disbursedAt: Date;
}

// ─────────────────────────────────────────────
//  ESCROW LEDGER
// ─────────────────────────────────────────────

export interface IEscrowLedger {
  id: string;
  poolId: string;
  hostId: string;
  amount: number;
  currency: string;
  scheduledFor: Date;
  status: TransactionStatus;
  processedAt: Date | null;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
//  TRANSACTION
// ─────────────────────────────────────────────

export interface ITransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  userId: string;
  membershipId: string | null;
  escrowCycleId: string | null;
  upiTransactionId: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  mandateId: string | null;
  failureReason: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTransactionInput {
  type: TransactionType;
  amount: number;
  userId: string;
  membershipId?: string;
  escrowCycleId?: string;
  currency?: string;
  upiTransactionId?: string;
  razorpayOrderId?: string;
  mandateId?: string;
}

export interface IUpdateTransactionInput {
  status?: TransactionStatus;
  upiTransactionId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
  processedAt?: Date;
}

// ─────────────────────────────────────────────
//  DISPUTE
// ─────────────────────────────────────────────

export interface IDispute {
  id: string;
  poolId: string;
  raisedById: string;
  reason: string;
  evidence: {
    urls?: string[];
    description?: string;
  } | null;
  status: DisputeStatus;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateDisputeInput {
  poolId: string;
  raisedById: string;
  reason: string;
  evidence?: {
    urls?: string[];
    description?: string;
  };
}

export interface IResolveDisputeInput {
  status: "RESOLVED_HOST_FAVOUR" | "RESOLVED_MEMBER_FAVOUR" | "CLOSED";
  resolution: string;
}

// ─────────────────────────────────────────────
//  NOTIFICATION
// ─────────────────────────────────────────────

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface ICreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────
//  AUDIT LOG
// ─────────────────────────────────────────────

export interface IAuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ICreateAuditLogInput {
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────
//  API RESPONSE WRAPPERS
// ─────────────────────────────────────────────

export interface IApiSuccess<T> {
  ok: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface IApiError {
  ok: false;
  code: string;     // e.g. "POOL_FULL" | "DUPLICATE_EMAIL"
  message: string;
  details?: unknown;
}

export type IApiResponse<T> = IApiSuccess<T> | IApiError;

// ─────────────────────────────────────────────
//  AUTH DTOs
// ─────────────────────────────────────────────

export interface IRegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;   // short-lived JWT (15 min)
  refreshToken: string;  // long-lived opaque token (30 days)
}

export interface IAuthResponse {
  user: IPublicUser;
  tokens: IAuthTokens;
}

export interface IJwtPayload {
  sub: string;      // userId
  role: UserRole;
  iat: number;
  exp: number;
}
