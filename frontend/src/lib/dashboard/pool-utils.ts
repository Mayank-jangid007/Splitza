import type { Pool } from './types'

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export function formatINR(amount: number) {
  return `INR ${inr.format(amount)}`
}

export function getInitials(name: string, length = 2) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, length)
    .toUpperCase()
}

export function getOpenSeats(pool: Pool) {
  return Math.max(pool.capacity - pool.filledSeats, 0)
}

export function getPoolCapital(pool: Pool) {
  return pool.poolCapital ?? pool.pricePerSeat * pool.capacity
}

export function getRecoveredSeats(pool: Pool) {
  return Math.max(pool.filledSeats - 1, 0)
}

export function getCostBreakdown(pool: Pool) {
  const recoveredSeats = getRecoveredSeats(pool)
  return {
    yourShare: pool.pricePerSeat,
    recoveredSeats,
    recoveredAmount: recoveredSeats * pool.pricePerSeat,
    totalValue: getPoolCapital(pool),
  }
}

export function getDaysElapsed(pool: Pool) {
  return Math.max(pool.totalDays - pool.daysLeft, 0)
}

export function matchesQuery(pool: Pool, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    pool.name.toLowerCase().includes(q) || pool.host.toLowerCase().includes(q)
  )
}
