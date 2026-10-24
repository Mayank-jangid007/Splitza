import type { Pool, PoolAccent } from './types'

export const neoLift =
  'shadow-brutal transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg active:translate-x-1 active:translate-y-1 active:shadow-none'

export const neoFocus =
  'outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const accentBg: Record<PoolAccent, string> = {
  lilac: 'bg-lilac',
  sun: 'bg-sun',
  mint: 'bg-mint',
  blush: 'bg-blush',
  peach: 'bg-peach',
}

const accents: PoolAccent[] = ['lilac', 'sun', 'mint', 'blush', 'peach']

export function getPoolAccent(pool: Pool): PoolAccent {
  if (pool.accent) return pool.accent
  let hash = 0
  for (const char of pool.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return accents[hash % accents.length]
}
