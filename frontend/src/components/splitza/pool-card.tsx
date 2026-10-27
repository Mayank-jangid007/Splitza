import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatINR, splitPrice, toneClass, type Pool } from '@/lib/pools'
import { SeatDots } from './seat-dots'

type PoolCardProps = {
  pool: Pool
  seatsLeft: number
  joined: boolean
  onOpen: (pool: Pool) => void
}

export function PoolCard({ pool, seatsLeft, joined, onOpen }: PoolCardProps) {
  const isFull = seatsLeft === 0
  const isLast = seatsLeft === 1

  return (
    <button
      type="button"
      onClick={() => onOpen(pool)}
      aria-label={`${pool.name}, hosted by ${pool.host}. ${seatsLeft} seats left. ${formatINR(splitPrice(pool))} per person.`}
      className={cn(
        'brut brut-press group relative flex w-full cursor-pointer flex-col gap-5 rounded-[2rem] p-5 text-left outline-none focus-visible:ring-4 focus-visible:ring-ink/30',
        isFull ? 'bg-muted' : toneClass[pool.tone],
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pool.logo} alt="" className="size-8 object-contain" loading="lazy" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-balance text-xl leading-tight font-extrabold tracking-tight">{pool.name}</h3>
          <p className="truncate text-sm font-medium text-ink/70">Hosted by {pool.host}</p>
        </div>
        <span className="brut-sm hidden shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold sm:inline-flex">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Escrow
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <SeatDots total={pool.totalSeats} filled={pool.totalSeats - seatsLeft} size="sm" />
        <p className="text-sm font-semibold">
          {pool.totalSeats - seatsLeft}/{pool.totalSeats} seats filled
          <span className="font-medium text-ink/60"> · {seatsLeft} open</span>
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wide text-ink/60 uppercase">Your share</span>
          <p className="font-mono text-2xl leading-none font-bold">
            {formatINR(splitPrice(pool))}
            <span className="font-sans text-sm font-semibold text-ink/60"> /mo</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {joined ? (
            <span className="rounded-full border-2 border-ink bg-ink px-3 py-1 text-xs font-bold text-cream">Joined</span>
          ) : isFull ? (
            <span className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold">Pool full</span>
          ) : (
            <span className={cn('rounded-full border-2 border-ink px-3 py-1 text-xs font-bold', isLast ? 'bg-bubble' : 'bg-white')}>
              {isLast ? 'Last seat!' : `${seatsLeft} seats left`}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-semibold text-ink/70">
            {pool.daysLeft} days left
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  )
}
