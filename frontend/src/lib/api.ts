/**
 * Splitza API Client
 * Handles all HTTP requests to the Express backend with JWT interceptors.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ---------------------------------------------------------------------------
// Token management (localStorage in browser)
// ---------------------------------------------------------------------------
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("splitza_token");
};

const setToken = (token: string): void => {
  localStorage.setItem("splitza_token", token);
};

const clearToken = (): void => {
  localStorage.removeItem("splitza_token");
};

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  headers?: Record<string, string>;
  authenticated?: boolean;
};

export class ApiError extends Error {
  public status: number;
  public data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    headers: extraHeaders = {},
    authenticated = true,
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (authenticated) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: "include", // send cookies for refresh token
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  // Auto-refresh on 401
  if (res.status === 401 && authenticated) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setToken(data.data.accessToken);
        headers["Authorization"] = `Bearer ${data.data.accessToken}`;
        // Retry original request
        const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
          method,
          headers,
          credentials: "include",
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        if (!retryRes.ok) {
          const errData = await retryRes.json().catch(() => ({}));
          const errMsg = errData.message || "Request failed";
          console.error(`❌ [API] ${method} ${endpoint} → ${retryRes.status}: ${errMsg}`);
          throw new ApiError(errMsg, retryRes.status, errData);
        }
        return retryRes.json();
      } else {
        console.warn(`⚠️ [API] Token refresh failed — redirecting to login`);
        clearToken();
        if (typeof window !== "undefined") window.location.href = "/auth/login";
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      clearToken();
    }
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ message: "Network error" }));
    const errMsg = errData.message || "Request failed";
    console.error(
      `❌ [API] ${method} ${endpoint} → ${res.status} ${res.statusText}\n   💬 ${errMsg}`,
      errData
    );
    throw new ApiError(errMsg, res.status, errData);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "HOST" | "COHOST" | "ADMIN";
  avatarUrl?: string;
  trustScore: number;
  createdAt?: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    otpSentTo?: string;
    devOtp?: string;
  };
};

export const auth = {
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "HOST" | "COHOST";
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: data, authenticated: false }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, authenticated: false }),

  verifyOtp: (identifier: string, otp: string) =>
    request<AuthResponse>("/auth/verify-otp", { method: "POST", body: { identifier, otp }, authenticated: false }),

  resendOtp: (identifier: string) =>
    request<{ success: boolean; message: string }>("/auth/resend-otp", {
      method: "POST", body: { identifier }, authenticated: false,
    }),

  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  me: () => request<{ success: boolean; data: { user: User } }>("/auth/me"),

  refresh: () => request<{ success: boolean; data: { accessToken: string; user: User } }>(
    "/auth/refresh", { method: "POST", authenticated: false }
  ),
};

// ---------------------------------------------------------------------------
// Plans API
// ---------------------------------------------------------------------------
export type Plan = {
  id: string;
  service: string;
  tier: string;
  description?: string;
  totalSlots: number;
  filledSlots: number;
  pricePerSlot: number;
  billingCycle: string;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  verifiedAt?: string;
  hostId: string;
  host?: User;
  slots?: Slot[];
  activeSlots?: number;
  monthlyEarnings?: number;
  createdAt: string;
};

export const plans = {
  list: (params?: { service?: string; minPrice?: number; maxPrice?: number; page?: number }) => {
    const queryObj: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) queryObj[k] = String(v);
      });
    }
    const qs = params ? "?" + new URLSearchParams(queryObj).toString() : "";
    return request<{ success: boolean; data: { plans: Plan[]; pagination: Record<string, unknown> } }>(`/plans${qs}`, { authenticated: false });
  },

  get: (id: string) =>
    request<{ success: boolean; data: { plan: Plan } }>(`/plans/${id}`, { authenticated: false }),

  create: (data: {
    service: string;
    tier: string;
    description?: string;
    totalSlots: number;
    pricePerSlot: number;
    billingCycle?: string;
  }) => request<{ success: boolean; data: { plan: Plan } }>("/plans", { method: "POST", body: data }),

  myPlans: () =>
    request<{ success: boolean; data: { plans: Plan[] } }>("/plans/my"),

  update: (id: string, data: Partial<Plan>) =>
    request<{ success: boolean; data: { plan: Plan } }>(`/plans/${id}`, { method: "PATCH", body: data }),

  close: (id: string) =>
    request<{ success: boolean }>(`/plans/${id}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Pools API (New Implementation)
// ---------------------------------------------------------------------------
export type Pool = {
  id: string;
  name?: string;
  platformName?: string;
  host?: string;
  hostName?: string;
  pricePerSeat: number;
  maxSeats: number;
  filledSeats?: number;
  status: string;
  visibility?: "PUBLIC" | "PRIVATE";
  planMonths: number;
  startDate?: string; // ISO string — for daysLeft calculation
};

export type MarketplacePoolItem = {
  id: string;
  platformName: string;
  platformSlug: string | null;
  platformLogoUrl: string | null;
  tier: string | null;
  hostName: string;
  hostTrustScore: number;
  pricePerSeat: number;
  maxSeats: number;
  filledSeats: number;
  openSeats: number;
  fillPercent: number;
  planMonths: number;
  currency: string;
  isCustom: boolean;
  status: string;
  createdAt: string;
};

export const poolsApi = {
  create: (data: any) =>
    request<{ ok: boolean; data: any }>("/pools", { method: "POST", body: data }),

  getMarketplace: (params?: { search?: string; planMonths?: number; hasOpenSeats?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.planMonths) qs.set("planMonths", String(params.planMonths));
    if (params?.hasOpenSeats) qs.set("hasOpenSeats", "true");
    const query = qs.toString();
    return request<{ ok: boolean; data: MarketplacePoolItem[]; meta: any }>(
      `/marketplace${query ? `?${query}` : ""}`
    );
  },

  getMyPools: () =>
    request<{ ok: boolean; data: Pool[] }>("/pools/my"),
};

// ---------------------------------------------------------------------------
// Slots API
// ---------------------------------------------------------------------------
export type Slot = {
  id: string;
  status: "OPEN" | "LOCKED" | "ACTIVE" | "DISPUTED" | "CLOSED";
  escrowLocked: boolean;
  escrowAmount?: number;
  planId: string;
  coHostId?: string;
  plan?: Plan;
  coHost?: User;
  payments?: Payment[];
  trustVotes?: TrustVote[];
};

export const slots = {
  join: (slotId: string) =>
    request<{ success: boolean; data: { slot: Slot; payment: Payment } }>(`/slots/${slotId}/join`, { method: "POST" }),

  leave: (slotId: string) =>
    request<{ success: boolean }>(`/slots/${slotId}/leave`, { method: "DELETE" }),

  mySlots: () =>
    request<{ success: boolean; data: { slots: Slot[] } }>("/slots/my"),

  get: (slotId: string) =>
    request<{ success: boolean; data: { slot: Slot } }>(`/slots/${slotId}`),

  getVotes: (slotId: string) =>
    request<{ success: boolean; data: { votes: TrustVote[]; summary: Record<string, unknown> } }>(`/slots/${slotId}/votes`),

  castVote: (slotId: string, vote: "TRUST" | "DISPUTE") =>
    request<{ success: boolean; data: { vote: TrustVote; payoutTriggered: boolean } }>(
      `/slots/${slotId}/votes`, { method: "POST", body: { vote } }
    ),
};

// ---------------------------------------------------------------------------
// Payments API
// ---------------------------------------------------------------------------
export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "ESCROWED" | "RELEASED" | "REFUNDED" | "FAILED";
  upiRef?: string;
  slotId: string;
  userId: string;
  createdAt: string;
  slot?: Slot;
};

export const payments = {
  history: (page?: number) =>
    request<{ success: boolean; data: { payments: Payment[]; totalPaid: number } }>(
      `/payments/history${page ? `?page=${page}` : ""}`
    ),

  hostEarnings: () =>
    request<{ success: boolean; data: { totalEarned: number; pending: number; netEarned: number; platformFee: number } }>(
      "/payments/host-earnings"
    ),

  createMandate: (slotId: string, amount: number, upiId?: string) =>
    request<{ success: boolean; data: Record<string, unknown> }>("/payments/mandate", {
      method: "POST", body: { slotId, amount, upiId },
    }),

  requestRelease: (slotId: string) =>
    request<{ success: boolean; message: string }>(`/payments/release/${slotId}`, { method: "POST" }),
};

// ---------------------------------------------------------------------------
// Trust Votes
// ---------------------------------------------------------------------------
export type TrustVote = {
  id: string;
  vote: "TRUST" | "DISPUTE";
  slotId: string;
  voterId: string;
  voter?: User;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Export token helpers for AuthContext
// ---------------------------------------------------------------------------
export { getToken, setToken, clearToken };
