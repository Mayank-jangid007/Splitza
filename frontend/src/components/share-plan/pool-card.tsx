import Image from 'next/image'
import { CalendarClock, Globe, Lock } from 'lucide-react'
import { formatINR, type PlanSummary, type Visibility } from '@/lib/pool'
import { cn } from '@/lib/utils'
import { Chip, SeatDots } from './neo'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0]).toUpperCase()
}

export function PoolCard({
  summary,
  visibility,
  className,
}: {
  summary: PlanSummary | null
  visibility: Visibility
  className?: string
}) {
  const name = summary?.name || 'Untitled pool'
  const seats = summary?.totalSeats ?? 0
  const hasPrice = !!summary && summary.monthlyPrice > 0

  return (
    <article
      aria-label="Pool preview"
      className={cn('rounded-3xl border-2 border-ink bg-paper p-5 hard-shadow-lg', className)}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink bg-sun">
          {summary?.logo ? (
            <Image src={summary.logo} alt="" width={28} height={28} className="size-7 object-contain" />
          ) : (
            <span className="font-display text-base font-black">{initials(summary?.name ?? '')}</span>
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-black leading-tight">{name}</p>
          <p className="text-xs text-stone">Host · You</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip tone="sun">Hosted by you</Chip>
        <Chip>
          {visibility === 'public' ? <Globe className="size-3" /> : <Lock className="size-3" />}
          {visibility}
        </Chip>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-ink bg-lilac p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Seats</span>
            <span className="text-sm font-bold">{seats ? `1 of ${seats} filled` : '—'}</span>
            {seats > 0 && <SeatDots total={seats} />}
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Per seat</span>
            <span className="font-display text-2xl font-black leading-none">
              {hasPrice ? formatINR(summary.perSeat) : '₹—'}
            </span>
            <span className="text-xs text-ink/70">/ {summary?.durationLabel || 'cycle'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5" />
          {summary?.totalDays ? `${summary.totalDays} days left` : 'Duration'}
        </span>
        <span className="text-stone">Total {hasPrice ? formatINR(summary.totalCost) : '—'}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper">
        <div className="stripe-bg h-full w-full bg-sun" />
      </div>
    </article>
  )
}
