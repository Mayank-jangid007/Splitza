'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowLeft, Check, Hourglass, Users } from 'lucide-react'
import { formatINR, splitPrice, type Pool } from '@/lib/pools'

type EscrowSuccessProps = { pool: Pool; upiId: string; reference: string; onBack?: () => void }

export function EscrowSuccess({ pool, upiId, reference, onBack }: EscrowSuccessProps) {
  return (
    <motion.section role="status" aria-live="polite"
      initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="brut flex flex-col gap-6 rounded-[2rem] bg-mint p-5 sm:p-7">
      <div className="flex items-center gap-4">
        <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 320, damping: 14 }}
          className="brut-sm grid size-16 shrink-0 place-items-center rounded-full bg-white">
          <Check className="size-8" strokeWidth={3.5} aria-hidden="true" />
        </motion.span>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-3xl leading-none font-extrabold tracking-tighter text-balance">Funds locked</h2>
          <p className="font-semibold text-ink/80">{formatINR(splitPrice(pool))} is safe in escrow.</p>
        </div>
      </div>

      <div className="brut-sm flex items-center gap-3 rounded-2xl bg-white p-4">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun">
          <Hourglass className="size-5" aria-hidden="true" />
          <span className="absolute -top-0.5 -right-0.5 flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-bubble opacity-75" />
            <span className="relative inline-flex size-3 rounded-full border-2 border-ink bg-bubble" />
          </span>
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="font-extrabold">Waiting for {pool.host.split(' ')[0]} to share credentials</span>
          <span className="text-sm font-medium text-ink/70">We have notified the host. You will get an alert the moment access is shared.</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Detail label="Paid via" value={upiId} />
        <Detail label="Reference" value={reference} />
        <Detail label="Pool" value={`${pool.totalSeats} members`} icon={<Users className="size-3.5" aria-hidden="true" />} />
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onBack}
          className="brut-sm brut-press flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 font-bold">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to marketplace
        </button>
        <button type="button" onClick={onBack}
          className="brut-sm brut-press flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 font-bold text-cream">
          View my shared pools
        </button>
      </div>
    </motion.section>
  )
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-xl border-2 border-ink bg-white/70 px-3 py-2">
      <dt className="flex items-center gap-1 text-xs font-bold tracking-wide text-ink/60 uppercase">{icon}{label}</dt>
      <dd className="truncate font-mono text-sm font-bold">{value}</dd>
    </div>
  )
}
