'use client'

import Link from 'next/link'
import { Dialog } from '@base-ui/react/dialog'
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
import { PoolLogo } from './pool-logo'
import { SeatMeter } from './seat-meter'
import { MonoLabel, Tag } from './tag'

interface PoolDetailsDialogProps {
  pool: Pool | null
  routes: DashboardRoutes
  onClose: () => void
}

export function PoolDetailsDialog({
  pool,
  routes,
  onClose,
}: PoolDetailsDialogProps) {
  return (
    <Dialog.Root
      open={pool !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/50 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border-2 border-foreground bg-background shadow-brutal-xl outline-none transition-[opacity,transform] duration-200 data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
          {pool && <DetailsBody pool={pool} routes={routes} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DetailsBody({ pool, routes }: { pool: Pool; routes: DashboardRoutes }) {
  const cost = getCostBreakdown(pool)
  const elapsedPct = Math.min(
    Math.round((getDaysElapsed(pool) / pool.totalDays) * 100),
    100,
  )
  const openSeats = getOpenSeats(pool)

  return (
    <>
      <div
        className={cn(
          'flex items-start gap-4 border-b-2 border-foreground p-5',
          accentBg[getPoolAccent(pool)],
        )}
      >
        <PoolLogo name={pool.name} logoUrl={pool.logoUrl} className="size-14" />
        <div className="min-w-0 flex-1">
          <Dialog.Title className="text-2xl font-extrabold leading-tight tracking-tight text-balance">
            {pool.name}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm font-semibold text-foreground/75">
            Hosted by {pool.host} · ends {pool.endsOn}
          </Dialog.Description>
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
        <Dialog.Close
          aria-label="Close details"
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-white shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
            neoFocus,
          )}
        >
          <X className="size-5" aria-hidden="true" />
        </Dialog.Close>
      </div>

      <div className="space-y-6 p-5">
        <section>
          <MonoLabel className="mb-3">Escrow status</MonoLabel>
          <EscrowStepper current={pool.escrowStep} />
        </section>

        <section>
          <MonoLabel className="mb-3">Seats</MonoLabel>
          <SeatMeter capacity={pool.capacity} filled={pool.filledSeats} />
          {openSeats > 0 && pool.role === 'host' && (
            <p className="mt-2 text-sm font-medium text-foreground/75">
              {openSeats} {openSeats === 1 ? 'seat is' : 'seats are'} still
              waiting for members.
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
            <span className="font-extrabold text-foreground">
              {pool.daysLeft} days left
            </span>{' '}
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
        <Link
          href={resolvePoolRoute(routes.pool, pool)}
          className={cn(
            'inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-foreground bg-sun text-sm font-bold',
            neoLift,
            neoFocus,
          )}
        >
          Open pool
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
        {pool.role === 'host' && (
          <Link
            href={resolvePoolRoute(routes.invites, pool)}
            className={cn(
              'inline-flex h-12 flex-1 items-center justify-center rounded-2xl border-2 border-foreground bg-white text-sm font-bold',
              neoLift,
              neoFocus,
            )}
          >
            Manage invites
          </Link>
        )}
      </div>
    </>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3',
        emphasis && 'bg-mint',
      )}
    >
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="font-mono text-sm font-bold">{value}</dd>
    </div>
  )
}
