'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  CalendarClock, Check, Loader2, Quote, Receipt,
  ScrollText, ShieldCheck, Star, Wallet, X,
} from 'lucide-react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'
import { formatINR, splitPrice, toneClass, type Pool } from '@/lib/pools'
import { PoolOccupancy } from './pool-occupancy'

type PoolDetailDialogProps = {
  pool: Pool | null
  seatsLeft: number
  joined: boolean
  onClose: () => void
  onJoin?: (pool: Pool) => void
}

export function PoolDetailDialog({ pool, seatsLeft, joined, onClose, onJoin }: PoolDetailDialogProps) {
  const [pending, setPending] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!pool) { setPending(false); return }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    setTimeout(() => closeRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [pool, onClose])

  const handleJoin = () => {
    if (!pool) return
    if (onJoin) {
      setPending(true)
      onJoin(pool)
    }
  }

  return (
    <AnimatePresence>
      {pool && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={pool.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="brut fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0 overflow-hidden rounded-[2rem] bg-cream p-0"
          >
            {/* Header */}
            <div className={cn('flex shrink-0 items-center gap-4 border-b-[2.5px] border-ink p-6 pr-14', toneClass[pool.tone])}>
              <span className="grid size-16 shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pool.logo} alt="" className="size-9 object-contain" />
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="w-fit rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-bold">{pool.category}</span>
                <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-balance">{pool.name}</h2>
                <p className="text-sm font-medium text-ink/70">Service: {pool.service}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close details"
                onClick={onClose}
                className="brut-sm absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-6">
              {/* Host */}
              <div className="brut-sm flex items-center gap-3 rounded-2xl bg-white p-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-lilac text-lg font-extrabold">
                  {pool.host.charAt(0)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs font-bold tracking-wide text-ink/60 uppercase">Host</span>
                  <span className="truncate font-bold">{pool.host}</span>
                  <span className="font-mono text-xs text-ink/60">{pool.hostHandle}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5 fill-sun stroke-ink" aria-hidden="true" />
                    {pool.hostRating.toFixed(1)}
                  </span>
                  <span className="text-ink/60">{pool.hostPools} pools hosted</span>
                </div>
              </div>

              {/* Stats */}
              <dl className="grid grid-cols-3 gap-3">
                <Stat icon={<Receipt className="size-4" />} label="Plan cost" value={formatINR(pool.totalCost)} suffix="per month" className="bg-white" />
                <Stat icon={<Wallet className="size-4" />} label="Your split" value={formatINR(splitPrice(pool))} suffix="per person" className="bg-mint" />
                <Stat icon={<CalendarClock className="size-4" />} label="Days left" value={`${pool.daysLeft} days`} suffix={`of ${pool.cycleDays}`} className="bg-bubble" />
              </dl>

              <PoolOccupancy pool={pool} seatsLeft={seatsLeft} joined={joined} />

              {/* Perks */}
              <ul className="flex flex-wrap gap-2">
                {pool.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-semibold">
                    <Check className="size-3.5" aria-hidden="true" />
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Rules */}
              <section aria-labelledby="plan-rules-heading" className="brut-sm flex flex-col gap-4 rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 id="plan-rules-heading" className="flex items-center gap-2 text-base font-extrabold">
                    <ScrollText className="size-5" aria-hidden="true" />
                    Plan rules
                  </h3>
                  <span className="rounded-full border-2 border-ink bg-lilac px-2.5 py-0.5 text-xs font-bold">Set by {pool.host.split(' ')[0]}</span>
                </div>
                <blockquote className="relative rounded-xl border-2 border-ink bg-cream p-3 pl-10 text-sm leading-relaxed font-medium">
                  <Quote className="absolute top-3 left-3 size-4 fill-ink" aria-hidden="true" />
                  {pool.description}
                </blockquote>
                <ol className="flex flex-col gap-2.5">
                  {pool.rules.map((rule, index) => (
                    <li key={rule} className="flex items-start gap-3 text-sm">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun font-mono text-xs font-bold">{index + 1}</span>
                      <span className="pt-0.5 leading-snug font-medium">{rule}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* CTA */}
              <div className="flex flex-col gap-3">
                {joined ? (
                  <div role="status" className="brut flex items-center justify-center gap-2 rounded-full bg-mint px-6 py-4 text-base font-extrabold">
                    <Check className="size-5" aria-hidden="true" />
                    You are in this pool
                  </div>
                ) : seatsLeft === 0 ? (
                  <button type="button" disabled className="rounded-full border-[2.5px] border-ink bg-muted px-6 py-4 text-base font-extrabold text-ink/60">
                    Pool is full
                  </button>
                ) : (
                  <ShimmerButton
                    type="button"
                    onClick={handleJoin}
                    disabled={pending}
                    shimmerColor="#f7c85a"
                    background="#151515"
                    className="h-14 w-full text-base font-extrabold shadow-[4px_4px_0_0_#f28fe0] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 disabled:opacity-80"
                  >
                    {pending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                        Taking you to secure escrow
                      </span>
                    ) : (
                      <span>Join Pool · {formatINR(splitPrice(pool))}/mo</span>
                    )}
                  </ShimmerButton>
                )}
                <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-ink/60">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Escrow-held. UPI payouts. Every seat verified by bot.
                </p>
                {!joined && seatsLeft > 0 && (
                  <p className="text-center text-xs font-medium text-ink/60">By joining you agree to the plan rules above.</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Stat({ icon, label, value, suffix, className }: {
  icon: React.ReactNode; label: string; value: string; suffix?: string; className?: string
}) {
  return (
    <div className={cn('brut-sm flex flex-col gap-2 rounded-2xl p-3.5', className)}>
      <dt className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-ink/70 uppercase">{icon}{label}</dt>
      <dd className="font-mono text-lg leading-none font-bold">
        {value}
        {suffix && <span className="mt-1.5 block font-sans text-xs font-semibold text-ink/60">{suffix}</span>}
      </dd>
    </div>
  )
}
