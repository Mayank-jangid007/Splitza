/**
 * Client side of the Razorpay QR payment.
 *
 * The browser NEVER decides that a payment succeeded. It only asks your server:
 *   POST {API}/payments/qr      { poolId }  -> { id, imageUrl, expiresAt }
 *   GET  {API}/payments/qr/:id              -> { status: 'active' | 'paid' | 'closed' }
 * The server creates the Razorpay QR (amount computed server-side from poolId) and
 * flips the status to 'paid' only from the verified Razorpay webhook (qr_code.credited).
 */

export type QrSession = {
  id: string
  /** Razorpay's hosted QR image (image_url) */
  imageUrl: string
  /** unix ms when the QR stops accepting payments */
  expiresAt: number
}

export type QrStatus = 'active' | 'paid' | 'closed'

/**
 * Base URL of the backend. Matches `lib/api.ts`: includes `/api` when
 * NEXT_PUBLIC_API_URL points at the backend, or falls back to the same-origin `/api`.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

/** Same auth the rest of the app sends: a Bearer token from localStorage. */
function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('splitza_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Set NEXT_PUBLIC_PAYMENT_MOCK=1 to run the whole flow without a backend (needs `qrcode`). */
export const PAYMENT_MOCK = process.env.NEXT_PUBLIC_PAYMENT_MOCK === '1'

export async function createQr(poolId: string, amountInr: number): Promise<QrSession> {
  if (PAYMENT_MOCK) {
    const mock = await import('./payments-mock')
    return mock.mockCreateQr(poolId, amountInr)
  }
  const res = await fetch(`${API_BASE}/payments/qr`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ poolId }), // amount is NOT sent: the server prices it
  })
  if (!res.ok) throw new Error('Could not create QR')
  return res.json()
}

export async function getQrStatus(id: string): Promise<QrStatus> {
  if (PAYMENT_MOCK) {
    const mock = await import('./payments-mock')
    return mock.mockGetStatus(id)
  }
  const res = await fetch(`${API_BASE}/payments/qr/${encodeURIComponent(id)}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Status check failed')
  const data = (await res.json()) as { status: QrStatus }
  return data.status
}

/** Preview only: pretends the user paid. No-op outside mock mode. */
export async function simulatePayment(id: string): Promise<void> {
  if (!PAYMENT_MOCK) return
  const mock = await import('./payments-mock')
  mock.mockPay(id)
}
