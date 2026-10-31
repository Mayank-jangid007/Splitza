'use client'

import { motion } from 'motion/react'
import { Lock, ShieldCheck } from 'lucide-react'
import type { Pool } from '@/lib/dashboard/types'
import { formatINR, getPoolCapital } from '@/lib/dashboard/pool-utils'
import {
  accentBg,
  getPoolAccent,
  neoFocus,
  neoLift,
} from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'
import { PoolLogo } from './pool-logo'
import { SeatMeter } from './seat-meter'
import { Tag } from './tag'

export function PoolCard({
  pool,
  onSelect,
  index = 0,
}: {
  pool: Pool
  onSelect: (pool: Pool) => void
  index?: number
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(pool)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`Open details for ${pool.name}`}
      className={cn(
        'block w-full cursor-pointer rounded-3xl border-2 border-foreground p-4 text-left sm:p-5',
        accentBg[getPoolAccent(pool)],
        neoLift,
        neoFocus,
      )}
    >
      <span className="flex items-start gap-3.5">
        <PoolLogo name={pool.name} logoUrl={pool.logoUrl} />
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="block truncate text-lg font-extrabold leading-tight tracking-tight">
              {pool.name}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-foreground bg-white px-2.5 py-0.5 text-xs font-bold">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Escrow {pool.escrowStep}/4
            </span>
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="text-sm font-semibold text-foreground/75">
              Hosted by {pool.host}
            </span>
            <Tag tone={pool.role === 'host' ? 'ink' : 'white'}>
              {pool.role === 'host' ? 'Hosted by you' : 'Joined'}
            </Tag>
            {pool.isPrivate && (
              <Tag tone="white">
                <Lock className="size-3" aria-hidden="true" />
                Private
              </Tag>
            )}
          </span>
        </span>
      </span>

      <span className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8">
        <SeatMeter capacity={pool.capacity} filled={pool.filledSeats} />
        <span className="flex items-baseline gap-3 sm:block sm:text-right">
          <span className="block text-4xl font-extrabold leading-none tracking-tight">
            {pool.daysLeft}
            <span className="ml-1.5 text-sm font-bold">days left</span>
          </span>
          <span className="block text-xs font-semibold text-foreground/70 sm:mt-1.5">
            {pool.totalDays} days total
          </span>
        </span>
      </span>

      <span className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 rounded-2xl bg-foreground p-4 text-background">
        <span>
          <span className="block text-xs font-semibold text-background/70">
            Fixed upfront pool capital
          </span>
          <span className="mt-1 block font-mono text-2xl font-bold leading-none tracking-tight text-sun">
            {formatINR(getPoolCapital(pool))}
          </span>
        </span>
        <span className="font-mono text-xs text-background/70">
          INR {pool.pricePerSeat.toLocaleString('en-IN')} per seat ·{' '}
          {pool.totalDays !== pool.planMonths * 30
            ? `${pool.totalDays} day term`
            : `${pool.planMonths} month term`}
        </span>
      </span>
    </motion.button>
  )
}
