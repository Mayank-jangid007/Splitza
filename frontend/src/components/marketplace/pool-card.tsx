import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatINR, splitPrice, toneClass, type MarketplacePoolFull } from '@/lib/marketplace-pools'
import { SeatDots } from './seat-dots'

export function PoolCard({
  pool,
  onOpen,
}: {
  pool: MarketplacePoolFull
  onOpen: (pool: MarketplacePoolFull) => void
}) {
  const isFull = pool.seatsLeft === 0
  const isLast = pool.seatsLeft === 1
  const filled = pool.totalSeats - pool.seatsLeft

  return (
    <button
      type="button"
      onClick={() => onOpen(pool)}
      aria-label={`${pool.name}, hosted by ${pool.host}. ${pool.seatsLeft} seats left. ${formatINR(splitPrice(pool))} per person.`}
      className={cn(
        'group relative flex w-full cursor-pointer flex-col gap-5 rounded-[2rem] p-5 text-left outline-none',
        'border-2 border-foreground transition-[transform,box-shadow] duration-150',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ink)] shadow-[4px_4px_0_0_var(--ink)]',
        'focus-visible:ring-4 focus-visible:ring-foreground/30',
        isFull ? 'bg-muted' : toneClass[pool.tone],
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pool.logo}
            alt={pool.service}
            className="size-11 rounded-full border-2 border-foreground bg-white object-contain p-1.5"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <h3 className="text-base font-extrabold leading-tight tracking-tight">{pool.name}</h3>
            <p className="mt-0.5 text-sm font-semibold text-foreground/70">Hosted by {pool.host}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-foreground bg-white px-2.5 py-0.5 text-xs font-bold">
          <ShieldCheck className="size-3.5" />
          Escrow
        </span>
      </div>

      {/* Seat meter */}
      <div>
        <SeatDots total={pool.totalSeats} filled={filled} size="sm" />
        <p className="mt-2 text-sm font-bold">
          {filled}/{pool.totalSeats} seats filled
          <span className="font-medium text-foreground/70"> · {pool.seatsLeft} open</span>
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-foreground/60">Your share</p>
          <p className="mt-0.5 font-mono text-2xl font-bold leading-none">
            {formatINR(splitPrice(pool))}
            <span className="ml-1 text-sm font-bold text-foreground/60">/mo</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isFull ? (
            <span className="rounded-full border-2 border-foreground bg-muted px-3 py-1 text-xs font-bold">Pool full</span>
          ) : isLast ? (
            <span className="rounded-full border-2 border-foreground bg-foreground px-3 py-1 text-xs font-bold text-background">Last seat!</span>
          ) : (
            <span className="rounded-full border-2 border-foreground bg-white px-3 py-1 text-xs font-bold">{pool.seatsLeft} seats left</span>
          )}
          <span className="text-xs font-semibold text-foreground/60">{pool.daysLeft} days left</span>
        </div>
      </div>

      <span className="absolute bottom-5 right-5 flex size-8 items-center justify-center rounded-full border-2 border-foreground bg-foreground text-background opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowUpRight className="size-4" />
      </span>
    </button>
  )
}
