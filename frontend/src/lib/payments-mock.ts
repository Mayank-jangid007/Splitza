// Dev/preview only. Needs:  npm i qrcode && npm i -D @types/qrcode
import QRCode from 'qrcode'
import type { QrSession, QrStatus } from './payments'

const QR_LIFETIME_MS = 5 * 60 * 1000
const sessions = new Map<string, { expiresAt: number; paid: boolean }>()

export async function mockCreateQr(poolId: string, amountInr: number): Promise<QrSession> {
  await new Promise((r) => setTimeout(r, 700))
  const id = `qr_demo_${Math.random().toString(36).slice(2, 10)}`
  const expiresAt = Date.now() + QR_LIFETIME_MS
  sessions.set(id, { expiresAt, paid: false })
  // Deliberately NOT a upi:// link: this demo QR can never move real money.
  const imageUrl = await QRCode.toDataURL(`SPLITZA-DEMO-QR|${poolId}|${amountInr}|${id}`, {
    margin: 1,
    width: 480,
    color: { dark: '#141414', light: '#ffffff' },
  })
  return { id, imageUrl, expiresAt }
}

export function mockGetStatus(id: string): QrStatus {
  const s = sessions.get(id)
  if (!s) return 'closed'
  if (s.paid) return 'paid'
  return Date.now() > s.expiresAt ? 'closed' : 'active'
}

export function mockPay(id: string) {
  const s = sessions.get(id)
  if (s) s.paid = true
}
