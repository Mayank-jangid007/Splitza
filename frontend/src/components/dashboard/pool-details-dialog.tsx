'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUpRight, Lock, X } from 'lucide-react'
import {
  resolvePoolRoute,
  type DashboardRoutes,
  type Pool,
} from '@/lib/dashboard/types'
import {
  formatINR,
  getCostBreakdown,
  getDaysElapsed,
  getOpenSeats,
} from '@/lib/dashboard/pool-utils'
import {
  accentBg,
  getPoolAccent,
  neoFocus,
  neoLift,
} from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'
import { EscrowStepper } from './escrow-stepper'
import { WeeklyPayoutProgress, buildWeeks } from './weekly-payout-progress'
import { PoolLogo } from './pool-logo'
import { SeatMeter } from './seat-meter'
import { MonoLabel, Tag } from './tag'
import { CoHostCard } from './co-host-card'

interface PoolDetailsDialogProps {
  pool: Pool | null
  routes: DashboardRoutes
  onClose: () => void
}

export function PoolDetailsDialog({ pool, routes, onClose }: PoolDetailsDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!pool) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pool, onClose])

  // Lock scroll + focus trap
  useEffect(() => {
    if (pool) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [pool])

  return (
    <AnimatePresence>
      {pool && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={pool.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto outline-none',
              pool.role === 'member'
                ? 'rounded-[36px]'
                : 'rounded-3xl border-2 border-foreground bg-background shadow-brutal-xl'
            )}
          >
            {pool.role === 'member' ? (
              <div className="relative">
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="absolute right-5 top-5 z-10 grid size-9 place-items-center rounded-full border-2 border-[#151515] bg-white shadow-[2px_2px_0_0_#151515] hover:bg-[#fbf6ee]"
                >
                  <X className="size-4" />
                </button>
                <CoHostCard pool={pool} />
              </div>
            ) : (
              <DetailsBody ref={closeRef} pool={pool} routes={routes} onClose={onClose} />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

import { forwardRef } from 'react'

const DetailsBody = forwardRef<HTMLButtonElement, { pool: Pool; routes: DashboardRoutes; onClose: () => void }>(
  function DetailsBody({ pool, routes, onClose }, ref) {
    const cost = getCostBreakdown(pool)
    const elapsedPct = Math.min(
      Math.round((getDaysElapsed(pool) / pool.totalDays) * 100),
      100,
    )
    const openSeats = getOpenSeats(pool)

    return (
      <>
        <div className={cn('flex items-start gap-4 border-b-2 border-foreground p-5', accentBg[getPoolAccent(pool)])}>
          <PoolLogo name={pool.name} logoUrl={pool.logoUrl} className="size-14" />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-balance">
              {pool.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-foreground/75">
              Hosted by {pool.host} · ends {pool.endsOn}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Tag tone={pool.role === 'host' ? 'ink' : 'white'}>
                {pool.role === 'host' ? 'Hosted by you' : 'Joined'}
              </Tag>
              {pool.isPrivate && (
                <Tag tone="white">
                  <Lock className="size-3" aria-hidden="true" />
                  Private
                </Tag>
              )}
            </div>
          </div>
          <button
            ref={ref}
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-white shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
              neoFocus,
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section>
            {pool.role === 'host' ? (
              <>
                <MonoLabel className="mb-3">Weekly payout</MonoLabel>
                <WeeklyPayoutProgress
                  weeks={buildWeeks(
                    pool.planMonths,
                    pool.pricePerSeat,
                    pool.filledSeats,
                    getDaysElapsed(pool),
                  )}
                />
              </>
            ) : (
              <>
                <MonoLabel className="mb-3">Escrow status</MonoLabel>
                <EscrowStepper current={pool.escrowStep} />
              </>
            )}
          </section>

          <section>
            <MonoLabel className="mb-3">Seats</MonoLabel>
            <SeatMeter capacity={pool.capacity} filled={pool.filledSeats} />
            {openSeats > 0 && pool.role === 'host' && (
              <p className="mt-2 text-sm font-medium text-foreground/75">
                {openSeats} {openSeats === 1 ? 'seat is' : 'seats are'} still waiting for members.
              </p>
            )}
          </section>

          <section>
            <MonoLabel className="mb-3">Term</MonoLabel>
            <div
              role="progressbar"
              aria-valuenow={elapsedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${elapsedPct}% of the term elapsed`}
              className="h-5 overflow-hidden rounded-full border-2 border-foreground bg-white"
            >
              <div
                className="h-full border-r-2 border-foreground bg-peach"
                style={{ width: `${elapsedPct}%` }}
              />
            </div>
            <p className="mt-2.5 text-sm font-medium text-foreground/75">
              <span className="font-extrabold text-foreground">{pool.daysLeft} days left</span>{' '}
              of {pool.totalDays}
            </p>
          </section>

          <section>
            <MonoLabel className="mb-3">Cost breakdown</MonoLabel>
            <dl className="divide-y-2 divide-foreground overflow-hidden rounded-2xl border-2 border-foreground bg-white shadow-brutal-sm">
              <Row label="Your share" value={formatINR(cost.yourShare)} />
              <Row
                label={`Recovered from ${cost.recoveredSeats} ${cost.recoveredSeats === 1 ? 'member' : 'members'}`}
                value={formatINR(cost.recoveredAmount)}
                emphasis
              />
              <Row label="Total plan value" value={formatINR(cost.totalValue)} />
            </dl>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-foreground p-5 sm:flex-row">
          <a
            href={resolvePoolRoute(routes.pool, pool)}
            className={cn(
              'inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-foreground bg-sun text-sm font-bold',
              neoLift,
              neoFocus,
            )}
          >
            Open pool
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          {pool.role === 'host' && (
            <a
              href={resolvePoolRoute(routes.invites, pool)}
              className={cn(
                'inline-flex h-12 flex-1 items-center justify-center rounded-2xl border-2 border-foreground bg-white text-sm font-bold',
                neoLift,
                neoFocus,
              )}
            >
              Manage invites
            </a>
          )}
        </div>
      </>
    )
  }
)
DetailsBody.displayName = 'DetailsBody'

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 px-4 py-3', emphasis && 'bg-mint')}>
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="font-mono text-sm font-bold">{value}</dd>
    </div>
  )
}
