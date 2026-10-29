'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AtSign, Loader2, Lock, ShieldCheck, TriangleAlert, X } from 'lucide-react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'
import type { MarketplacePool } from '@/components/marketplace-view'
import { EscrowSuccess } from './escrow-success'
import { EscrowTracker } from './escrow-tracker'

const UPI_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/
const UPI_HANDLES = ['@okaxis', '@oksbi', '@ybl', '@paytm', '@upi']

type Status = 'idle' | 'processing' | 'locked'

interface EscrowCheckoutProps {
  pool: MarketplacePool | null
  onClose: () => void
}

export function EscrowCheckout({ pool, onClose }: EscrowCheckoutProps) {
  const [upiId, setUpiId] = useState('')
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [reference, setReference] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!pool) {
      setUpiId('')
      setTouched(false)
      setStatus('idle')
      setReference('')
      return
    }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    setTimeout(() => closeRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
      window.clearTimeout(timer.current)
    }
  }, [pool, onClose])

  if (!pool) return null

  const trimmed = upiId.trim()
  const valid = UPI_PATTERN.test(trimmed)
  const showError = touched && !valid
  const locked = status === 'locked'
  const splitAmount = Math.ceil(pool.price)

  const applyHandle = (handle: string) => {
    const name = upiId.split('@')[0]
    setUpiId(`${name}${handle}`)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched(true)
    if (!valid || status !== 'idle') return
    setStatus('processing')
    timer.current = window.setTimeout(() => {
      setReference(`SPZ-${Date.now().toString(36).toUpperCase().slice(-6)}`)
      setStatus('locked')
    }, 1800)
  }

  const poolShape = {
    id: pool.id,
    name: pool.service,
    service: pool.service,
    category: pool.category as any,
    host: pool.hostName,
    hostHandle: '',
    logo: pool.logoUrl ?? '',
    totalCost: pool.price * pool.total,
    totalSeats: pool.total,
    seatsLeft: pool.available,
    daysLeft: pool.remainingDays,
    cycleDays: pool.term * 30,
    tone: 'sun' as const,
    perks: [],
    description: '',
    rules: [],
    hostRating: 4.8,
    hostPools: 1,
  }

  return (
    <AnimatePresence>
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose} aria-hidden="true" />

      <motion.div key="dialog" role="dialog" aria-modal="true" aria-label="Secure escrow payment"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="brut fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[2rem] bg-cream p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b-[2.5px] border-ink bg-sun p-5">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink/60">Secure escrow</p>
            <h2 className="mt-0.5 text-2xl font-extrabold tracking-tight">{pool.service}</h2>
          </div>
          <button ref={closeRef} type="button" aria-label="Close" onClick={onClose}
            className="brut-sm flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 p-5">
          <EscrowTracker current={locked ? 1 : 0} />

          {locked ? (
            <EscrowSuccess pool={poolShape} upiId={trimmed} reference={reference} onBack={onClose} />
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Authorize UPI payment"
              className="brut flex flex-col gap-6 rounded-[2rem] bg-sun p-5">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-extrabold tracking-tight">Pay with UPI</h3>
                <p className="text-sm font-medium text-ink/75">
                  Lock <span className="font-mono font-bold">INR {splitAmount.toLocaleString('en-IN')}</span> in escrow.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <label htmlFor="upi-id" className="text-sm font-bold">Your UPI ID</label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink/60" aria-hidden="true" />
                  <input id="upi-id" name="upi" type="text" inputMode="email"
                    autoComplete="off" autoCapitalize="none" spellCheck={false}
                    placeholder="yourname@okaxis" value={upiId}
                    disabled={status === 'processing'}
                    onChange={(e) => setUpiId(e.target.value)}
                    onBlur={() => upiId && setTouched(true)}
                    aria-invalid={showError}
                    aria-describedby={showError ? 'upi-error' : 'upi-hint'}
                    className={cn('h-14 w-full rounded-full border-[2.5px] border-ink bg-white pr-5 pl-12 font-mono text-base font-semibold shadow-brut-sm outline-none',
                      showError && 'border-destructive')} />
                </div>

                {showError ? (
                  <p id="upi-error" role="alert" className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                    <TriangleAlert className="size-4" /> Enter a valid UPI ID, like name@okaxis.
                  </p>
                ) : (
                  <p id="upi-hint" className="text-xs font-medium text-ink/70">Tap a handle to finish your ID faster.</p>
                )}

                <ul className="flex flex-wrap gap-2" aria-label="UPI handles">
                  {UPI_HANDLES.map((handle) => (
                    <li key={handle}>
                      <button type="button" onClick={() => applyHandle(handle)} disabled={status === 'processing'}
                        className="rounded-full border-2 border-ink bg-white px-3 py-1 font-mono text-xs font-bold transition-colors hover:bg-mint disabled:opacity-60">
                        {handle}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary row */}
              <div className="flex items-center justify-between rounded-2xl border-2 border-ink bg-white p-4">
                <div>
                  <p className="text-xs font-bold text-ink/60 uppercase tracking-wide">Your split</p>
                  <p className="font-mono text-2xl font-bold">
                    INR {splitAmount.toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-ink/60">/mo</span>
                  </p>
                </div>
                <div className="text-right text-xs text-ink/60">
                  <p>{pool.total} members</p>
                  <p>{pool.remainingDays} days left</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <ShimmerButton type="submit" disabled={status === 'processing'}
                  shimmerColor="#f7c85a" background="#151515"
                  className="h-14 w-full text-base font-extrabold shadow-[4px_4px_0_0_#f28fe0] disabled:opacity-80">
                  {status === 'processing' ? (
                    <span className="flex items-center gap-2"><Loader2 className="size-5 animate-spin" />Approve in your UPI app</span>
                  ) : (
                    <span className="flex items-center gap-2"><Lock className="size-5" />Lock INR {splitAmount.toLocaleString('en-IN')} in escrow</span>
                  )}
                </ShimmerButton>
                <p className="flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-ink/75">
                  <ShieldCheck className="size-4 shrink-0" /> By confirming, you authorize Splitza to hold this in escrow.
                </p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
