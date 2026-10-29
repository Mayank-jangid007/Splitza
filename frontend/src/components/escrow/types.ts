import type { MarketplacePool } from '@/components/marketplace-view'
import type { PoolCredentials } from '@/lib/api'

export type EscrowStage = 'pay' | 'processing' | 'success' | 'credentials' | 'dashboard'

export interface EscrowPool {
  id: string
  name: string
  host: string
  seat: string
  seatNo: number
  pin: string
  username: string
  password: string
  inviteLink: string | null
  logoUrl: string | null
  amount: string
  split: string
  total: string
  members: number
  reference: string
}

export function toEscrowPool(
  p: MarketplacePool,
  creds?: PoolCredentials | null,
  reference?: string,
): EscrowPool {
  const splitAmt = Math.ceil(p.price)
  const totalAmt = p.price * p.total
  const seatNo = creds?.seatNo ?? Math.min(p.total - p.available + 1, p.total)

  return {
    id: p.id,
    name: p.service,
    host: p.hostName,
    seat: `Seat ${seatNo} of ${p.total}`,
    seatNo,
    pin: creds?.pin || '—',
    username: creds?.username || '',
    password: creds?.password || '',
    inviteLink: creds?.inviteLink ?? null,
    logoUrl: p.logoUrl,
    amount: `INR ${splitAmt.toLocaleString('en-IN')}`,
    split: `INR ${splitAmt.toLocaleString('en-IN')}/mo`,
    total: `INR ${totalAmt.toLocaleString('en-IN')}/mo`,
    members: p.total,
    reference: reference || `SPZ-${Date.now().toString(36).toUpperCase().slice(-6)}`,
  }
}
