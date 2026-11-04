import { ArrowUpRight, CalendarClock, Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { planDurationLabel, rupee, type Pool } from '@/lib/splitza'
import { Chip, PlatformLogo } from './ui'

export function SeatDots({ filled, seats }: { filled: number; seats: number }) {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: seats }, (_, i) => (
        <span
          key={i}
          className={cn(
            'size-3.5 rounded-full border-2 border-ink',
            i < filled ? 'bg-ink' : 'bg-paper',
          )}
        />
      ))}
    </span>
  )
}

export function PoolCard({
  pool,
  onOpen,
  accent,
}: {
  pool: Pool
  onOpen: (pool: Pool) => void
  accent: string
}) {
  const elapsed = Math.max(pool.totalDays - pool.daysLeft, 0)
  const pct = Math.min(100, Math.round((elapsed / pool.totalDays) * 100))

  return (
    <article
      className="neo-press group relative flex min-w-0 flex-col gap-5 rounded-3xl border-2 border-ink bg-paper p-5 shadow-neo"
    >
      <div className="flex items-start gap-4">
        <PlatformLogo name={pool.name} size={56} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display-tight truncate text-xl font-black">
            <button
              type="button"
              onClick={() => onOpen(pool)}
              className="text-left outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-4 focus-visible:after:ring-ink/40"
            >
              {pool.name}
            </button>
          </h3>
          <p className="mt-1 truncate text-xs text-ink/70">
            Host · {pool.role === 'hosted' ? `${pool.host} (you)` : pool.host}
          </p>
        </div>
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun transition-transform group-hover:rotate-45"
          aria-hidden="true"
        >
          <ArrowUpRight className="size-4" strokeWidth={3} />
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip tone={pool.role === 'hosted' ? 'sun' : 'sky'}>
          {pool.role === 'hosted' ? 'Hosted by you' : 'Joined'}
        </Chip>
        <Chip tone="paper">
          {pool.visibility === 'private' ? (
            <Lock className="size-3" strokeWidth={3} />
          ) : (
            <Globe className="size-3" strokeWidth={3} />
          )}
          {pool.visibility}
        </Chip>
      </div>

      <div className={cn('grid grid-cols-2 gap-3 rounded-2xl border-2 border-ink p-4', accent)}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest">Seats</p>
          <p className="mt-1 text-sm font-bold">
            {pool.filled} of {pool.seats} filled
          </p>
          <div className="mt-2">
            <SeatDots filled={pool.filled} seats={pool.seats} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest">Per seat</p>
          <p className="font-display-tight mt-1 text-2xl font-black">{rupee(pool.pricePerSeat)}</p>
          <p className="text-[11px] font-medium">/ {planDurationLabel(pool)}</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5" strokeWidth={3} />
            {pool.daysLeft} days left
          </span>
          <span>of {pool.totalDays}</span>
        </div>
        <div
          role="progressbar"
          aria-label="Plan time elapsed"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-3.5 overflow-hidden rounded-full border-2 border-ink bg-paper"
        >
          <div className="h-full border-r-2 border-ink bg-ink" style={{ width: `${pct}%` }} />
        </div>
      </div>

    </article>
  )
}
