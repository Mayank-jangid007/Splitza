'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  CalendarClock, Check, Receipt, ScrollText,
  ShieldCheck, Star, Users, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatINR, splitPrice, toneClass, type MarketplacePoolFull } from '@/lib/marketplace-pools'
import { SeatDots } from './seat-dots'

export function PoolDetailDialog({
  pool,
  onClose,
  onJoin,
}: {
  pool: MarketplacePoolFull | null
  onClose: () => void
  onJoin: (pool: MarketplacePoolFull) => void
}) {
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

  const filled = pool ? pool.totalSeats - pool.seatsLeft : 0
  const isFull = pool?.seatsLeft === 0

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
            className="fixed inset-0 z-50 bg-foreground/50"
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
            className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border-2 border-foreground bg-background shadow-[8px_8px_0_0_var(--ink)] outline-none"
          >
            {/* Header */}
            <div className={cn('flex items-start gap-4 border-b-2 border-foreground p-5', toneClass[pool.tone])}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pool.logo}
                alt={pool.service}
                className="size-14 rounded-full border-2 border-foreground bg-white object-contain p-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/60">{pool.category}</p>
                <h2 className="mt-0.5 text-2xl font-extrabold leading-tight tracking-tight">{pool.name}</h2>
                <p className="mt-1 text-sm font-semibold text-foreground/70">Service: {pool.service}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close details"
                onClick={onClose}
                className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-white shadow-[2px_2px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Host */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border-2 border-foreground bg-sun font-extrabold text-sm">
                    {pool.host.charAt(0)}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground/60">Host</p>
                    <p className="font-bold">{pool.host}</p>
                    <p className="text-xs text-foreground/60">{pool.hostHandle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-sun stroke-foreground" />
                    <span className="font-mono font-bold">{pool.hostRating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-foreground/60">{pool.hostPools} pools hosted</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Stat icon={<Receipt className="size-4" />} label="Plan cost" value={formatINR(pool.totalCost)} suffix="per month" className="bg-white" />
                <Stat icon={<Users className="size-4" />} label="Your split" value={formatINR(splitPrice(pool))} suffix="per person" className="bg-mint" />
                <Stat icon={<CalendarClock className="size-4" />} label="Days left" value={`${pool.daysLeft}`} suffix={`of ${pool.cycleDays}`} className="bg-bubble" />
              </div>

              {/* Seats */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/60">Seats</p>
                <SeatDots total={pool.totalSeats} filled={filled} />
                <p className="mt-2 text-sm font-bold">
                  {filled}/{pool.totalSeats} seats filled
                  <span className="font-medium text-foreground/70"> · {pool.seatsLeft} open</span>
                </p>
              </div>

              {/* Perks */}
              <ul className="flex flex-wrap gap-2">
                {pool.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-white px-3 py-1 text-xs font-bold">
                    <Check className="size-3.5" strokeWidth={3} />
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Description + rules */}
              <div className="rounded-2xl border-2 border-foreground bg-white p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ScrollText className="size-4 shrink-0" />
                  <p className="font-bold text-sm">Plan rules</p>
                  <span className="ml-auto text-xs text-foreground/60">Set by {pool.host.split(' ')[0]}</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground/75">{pool.description}</p>
                <ol className="space-y-2">
                  {pool.rules.map((rule, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-foreground p-5 space-y-3">
              {isFull ? (
                <div className="flex h-12 items-center justify-center rounded-2xl border-2 border-foreground bg-muted font-bold text-foreground/60">
                  Pool is full
                </div>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => { setPending(true); onJoin(pool) }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-foreground bg-foreground text-sm font-extrabold text-background transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)] disabled:opacity-70"
                >
                  {pending ? 'Taking you to escrow...' : `Join Pool · ${formatINR(splitPrice(pool))}/mo`}
                </button>
              )}
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground/60">
                <ShieldCheck className="size-3.5" />
                Escrow-held. UPI payouts. Every seat verified by bot.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Stat({
  icon, label, value, suffix, className,
}: {
  icon: React.ReactNode
  label: string
  value: string
  suffix?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-2xl border-2 border-foreground p-3', className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/60">
        {icon}{label}
      </div>
      <p className="font-mono text-lg font-bold leading-tight">{value}</p>
      {suffix && <p className="text-xs text-foreground/60">{suffix}</p>}
    </div>
  )
}
