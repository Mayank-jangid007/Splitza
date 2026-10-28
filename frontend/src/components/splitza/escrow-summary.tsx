import { Lock, ShieldCheck, Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatINR, splitPrice, toneClass, type Pool } from '@/lib/pools'

export function EscrowSummary({ pool, locked }: { pool: Pool; locked: boolean }) {
  const split = splitPrice(pool)
  return (
    <aside aria-label="Payment summary" className="brut flex flex-col overflow-hidden rounded-[2rem] bg-white xl:sticky xl:top-6">
      <div className={cn('flex items-center gap-3 border-b-[2.5px] border-ink p-5', toneClass[pool.tone])}>
        <span className="grid size-14 shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pool.logo} alt="" className="size-8 object-contain" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-bold tracking-wide text-ink/70 uppercase">You are joining</span>
          <h2 className="truncate text-xl leading-tight font-extrabold tracking-tight">{pool.name}</h2>
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
            Hosted by {pool.host}
            <span className="flex shrink-0 items-center gap-0.5 text-xs">
              <Star className="size-3 fill-ink" aria-hidden="true" />
              {pool.hostRating.toFixed(1)}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5 p-5">
        <h3 className="text-base font-extrabold">Payment summary</h3>
        <dl className="flex flex-col gap-3 text-sm">
          <Row label="Total plan value" value={formatINR(pool.totalCost)} suffix="/mo" />
          <Row label="Members splitting" value={`${pool.totalSeats} people`} icon={<Users className="size-4" aria-hidden="true" />} />
          <Row label="Your split" value={formatINR(split)} suffix="/mo" strong />
        </dl>
        <div className="border-t-2 border-dashed border-ink/30" />
        <div className="flex items-end justify-between gap-3">
          <span className="font-bold">{locked ? 'Locked in escrow' : 'Due today'}</span>
          <span className="font-mono text-3xl leading-none font-bold">{formatINR(split)}</span>
        </div>
        <p className="flex items-start gap-2 rounded-2xl border-2 border-ink bg-mint p-3 text-xs leading-snug font-semibold">
          {locked
            ? <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            : <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          The host is paid only after your seat is verified as active.
        </p>
      </div>
    </aside>
  )
}

function Row({ label, value, suffix, strong, icon }: {
  label: string; value: string; suffix?: string; strong?: boolean; icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 font-medium text-ink/70">{icon}{label}</dt>
      <dd className={cn('font-mono', strong ? 'text-base font-bold' : 'font-semibold')}>
        {value}
        {suffix && <span className="font-sans text-xs text-ink/60">{suffix}</span>}
      </dd>
    </div>
  )
}
