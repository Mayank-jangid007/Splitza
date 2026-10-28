'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, AtSign, Loader2, Lock, ShieldCheck, TriangleAlert } from 'lucide-react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { cn } from '@/lib/utils'
import type { MarketplacePool } from '@/components/marketplace-view'
import { EscrowSuccess } from './escrow-success'
import { EscrowTracker } from './escrow-tracker'

const UPI_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/
const UPI_HANDLES = ['@okaxis', '@oksbi', '@ybl', '@paytm', '@upi']

type Status = 'idle' | 'processing' | 'locked'

// Adapt MarketplacePool → the shape EscrowSuccess/Summary expect
function toPoolShape(p: MarketplacePool) {
  return {
    id: p.id,
    name: p.service,
    service: p.service,
    category: p.category as any,
    host: p.hostName,
    hostHandle: '',
    logo: p.logoUrl ?? '',
    totalCost: p.price * p.total,
    totalSeats: p.total,
    seatsLeft: p.available,
    daysLeft: p.remainingDays,
    cycleDays: p.term * 30,
    tone: 'sun' as const,
    perks: [],
    description: '',
    rules: [],
    hostRating: 4.8,
    hostPools: 1,
  }
}

interface EscrowCheckoutProps {
  pool: MarketplacePool
  onBack: () => void
}

export function EscrowCheckout({ pool, onBack }: EscrowCheckoutProps) {
  const [upiId, setUpiId] = useState('')
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [reference, setReference] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const trimmed = upiId.trim()
  const valid = UPI_PATTERN.test(trimmed)
  const showError = touched && !valid
  const locked = status === 'locked'
  const splitAmount = Math.ceil((pool.price * pool.total) / pool.total)
  const poolShape = toPoolShape(pool)

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

  return (
    <div className="flex flex-col gap-6">
      {!locked && (
        <button type="button" onClick={onBack}
          className="flex w-fit items-center gap-2 rounded-full border-2 border-foreground bg-white px-4 py-2 text-sm font-bold transition-transform hover:-translate-x-0.5">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to marketplace
        </button>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <EscrowTracker current={locked ? 1 : 0} />

          {locked ? (
            <EscrowSuccess pool={poolShape} upiId={trimmed} reference={reference} onBack={onBack} />
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Authorize UPI payment"
              className="brut flex flex-col gap-6 rounded-[2rem] bg-sun p-5 sm:p-7">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Pay with UPI</h2>
                <p className="text-sm font-medium text-ink/75">
                  Enter your UPI ID and approve the request to lock{' '}
                  <span className="font-mono font-bold">INR {splitAmount.toLocaleString('en-IN')}</span>{' '}
                  in escrow.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <label htmlFor="upi-id" className="text-sm font-bold">Your UPI ID</label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink/60" aria-hidden="true" />
                  <input
                    id="upi-id"
                    name="upi"
                    type="text"
                    inputMode="email"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="yourname@okaxis"
                    value={upiId}
                    disabled={status === 'processing'}
                    onChange={(e) => setUpiId(e.target.value)}
                    onBlur={() => upiId && setTouched(true)}
                    aria-invalid={showError}
                    aria-describedby={showError ? 'upi-error' : 'upi-hint'}
                    className={cn(
                      'h-14 w-full rounded-full border-[2.5px] border-ink bg-white pr-5 pl-12 font-mono text-base font-semibold shadow-brut-sm outline-none transition-[box-shadow] focus-visible:ring-4 focus-visible:ring-ink/20',
                      showError && 'border-destructive',
                    )}
                  />
                </div>

                {showError ? (
                  <p id="upi-error" role="alert" className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                    <TriangleAlert className="size-4" aria-hidden="true" />
                    Enter a valid UPI ID, like name@okaxis.
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

              <div className="flex flex-col gap-3">
                <ShimmerButton type="submit" disabled={status === 'processing'}
                  shimmerColor="#f7c85a" background="#151515"
                  className="h-14 w-full text-base font-extrabold shadow-[4px_4px_0_0_#f28fe0] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 disabled:opacity-80">
                  {status === 'processing' ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                      Approve the request in your UPI app
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="size-5" aria-hidden="true" />
                      Lock INR {splitAmount.toLocaleString('en-IN')} in escrow
                    </span>
                  )}
                </ShimmerButton>
                <p className="flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-ink/75">
                  <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                  By confirming, you authorize Splitza to collect this amount and hold it in escrow.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Summary sidebar */}
        <aside aria-label="Payment summary" className="brut flex flex-col overflow-hidden rounded-[2rem] bg-white xl:sticky xl:top-6">
          <div className="flex items-center gap-3 border-b-[2.5px] border-ink bg-sun p-5">
            {pool.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pool.logoUrl} alt="" className="size-12 rounded-full border-2 border-ink bg-white object-contain p-1.5" />
            )}
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold tracking-wide text-ink/70 uppercase">You are joining</span>
              <h2 className="truncate text-xl font-extrabold tracking-tight">{pool.service}</h2>
              <p className="truncate text-sm font-semibold text-ink/70">Hosted by {pool.hostName}</p>
            </div>
          </div>
          <div className="flex flex-col gap-5 p-5">
            <h3 className="text-base font-extrabold">Payment summary</h3>
            <dl className="flex flex-col gap-3 text-sm">
              <SummaryRow label="Plan cost" value={`INR ${(pool.price * pool.total).toLocaleString('en-IN')}`} suffix="/mo" />
              <SummaryRow label="Members splitting" value={`${pool.total} people`} />
              <SummaryRow label="Your split" value={`INR ${splitAmount.toLocaleString('en-IN')}`} suffix="/mo" strong />
            </dl>
            <div className="border-t-2 border-dashed border-ink/30" />
            <div className="flex items-end justify-between gap-3">
              <span className="font-bold">{locked ? 'Locked in escrow' : 'Due today'}</span>
              <span className="font-mono text-3xl font-bold">INR {splitAmount.toLocaleString('en-IN')}</span>
            </div>
            <p className="flex items-start gap-2 rounded-2xl border-2 border-ink bg-mint p-3 text-xs font-semibold leading-snug">
              {locked
                ? <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                : <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
              The host is paid only after your seat is verified as active.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, suffix, strong }: { label: string; value: string; suffix?: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-medium text-ink/70">{label}</dt>
      <dd className={cn('font-mono', strong ? 'text-base font-bold' : 'font-semibold')}>
        {value}{suffix && <span className="font-sans text-xs text-ink/60">{suffix}</span>}
      </dd>
    </div>
  )
}
