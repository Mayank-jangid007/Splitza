'use client'

import type { MarketplacePool } from '@/components/marketplace-view'
import type { MarketPool } from '@/lib/splitza'
import { JoinFlow } from '@/components/splitza/pool-detail-dialog'

interface EscrowFlowProps {
  pool: MarketplacePool | null
  onClose: () => void
  onJoinComplete?: () => void
}

const CATEGORY_VALUES: MarketPool['category'][] = [
  'Entertainment',
  'Music',
  'Cloud',
  'Education',
  'Games',
  'Others',
]

function toMarketPool(pool: MarketplacePool): MarketPool {
  const days = Math.max(1, pool.remainingDays || pool.term * 30)
  const months = Math.max(1, Math.round(days / 30))
  const category = CATEGORY_VALUES.includes(pool.category as MarketPool['category'])
    ? (pool.category as MarketPool['category'])
    : 'Others'
  return {
    id: pool.id,
    name: pool.service,
    host: pool.hostName || 'Host',
    trust: 4.5,
    pricePerSeat: pool.price,
    durationMonths: months,
    durationDays: days,
    seats: pool.total,
    filled: Math.max(pool.total - pool.available, 0),
    category,
  }
}

export function EscrowFlow({ pool, onClose, onJoinComplete }: EscrowFlowProps) {
  return (
    <JoinFlow
      pool={pool ? toMarketPool(pool) : null}
      onClose={onClose}
      onComplete={() => onJoinComplete?.()}
      onDone={() => onJoinComplete?.()}
    />
  )
}
