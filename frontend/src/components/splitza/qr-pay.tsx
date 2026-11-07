'use client'

import { Check, CircleAlert, Loader2, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { PAYMENT_MOCK, createQr, getQrStatus, simulatePayment, type QrSession } from '@/lib/payments'
import { rupee } from '@/lib/splitza'
import { Chip, NeoButton } from './ui'

type Phase = 'creating' | 'waiting' | 'paid' | 'expired' | 'error'

const POLL_MS = 2500
const PAID_HOLD_MS = 1200 // how long "Payment received" stays before moving on

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export function QrPay({
  poolId,
  amount,
  onBack,
  onPaid,
}: {
  poolId: string
  amount: number
  onBack: () => void
  onPaid: () => void
}) {
  const [phase, setPhase] = useState<Phase>('creating')
  const [qr, setQr] = useState<QrSession | null>(null)
  const [left, setLeft] = useState(0)
  const [total, setTotal] = useState(1)
  const [checking, setChecking] = useState(false)
  const [notYet, setNotYet] = useState(false)

  const doneRef = useRef(false)
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onPaidRef = useRef(onPaid)

  useEffect(() => {
    onPaidRef.current = onPaid
  }, [onPaid])

  // 1. create a fresh single-use QR (on mount, and whenever the user asks for a new one)
  const reqRef = useRef(0)
  const generate = useCallback(async () => {
    const req = ++reqRef.current
    setPhase('creating')
    setNotYet(false)
    try {
      const s = await createQr(poolId, amount)
      if (req !== reqRef.current) return // a newer request or unmount won
      const secs = Math.max(0, Math.round((s.expiresAt - Date.now()) / 1000))
      setQr(s)
      setTotal(Math.max(secs, 1))
      setLeft(secs)
      setPhase('waiting')
    } catch {
      if (req === reqRef.current) setPhase('error')
    }
  }, [poolId, amount])

  useEffect(() => {
    const t = setTimeout(() => {
      void generate()
    }, 0)
    return () => {
      clearTimeout(t)
      reqRef.current++
    }
  }, [generate])

  // 2. payment confirmed -> show success, then leave this step on its own
  const handlePaid = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('paid')
    holdRef.current = setTimeout(() => onPaidRef.current(), PAID_HOLD_MS)
  }, [])

  useEffect(() => () => {
    if (holdRef.current) clearTimeout(holdRef.current)
  }, [])

  const check = useCallback(async () => {
    if (!qr || doneRef.current) return
    try {
      const status = await getQrStatus(qr.id)
      if (status === 'paid') handlePaid()
      else if (status === 'closed') setPhase((p) => (p === 'waiting' ? 'expired' : p))
    } catch {
      // transient network error: the next poll will retry
    }
  }, [qr, handlePaid])

  // 3. countdown + polling while the QR is live
  useEffect(() => {
    if (phase !== 'waiting' || !qr) return
    const tick = setInterval(() => {
      const secs = Math.round((qr.expiresAt - Date.now()) / 1000)
      if (secs <= 0) {
        setLeft(0)
        setPhase('expired')
      } else setLeft(secs)
    }, 1000)
    const poll = setInterval(check, POLL_MS)
    return () => {
      clearInterval(tick)
      clearInterval(poll)
    }
  }, [phase, qr, check])

  const manualCheck = async () => {
    setChecking(true)
    setNotYet(false)
    await Promise.all([check(), new Promise((r) => setTimeout(r, 900))])
    setChecking(false)
    if (!doneRef.current) setNotYet(true)
  }

  const live = phase === 'waiting'
  const low = live && left <= 30

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border-2 border-ink bg-sun p-4">
        <span className="text-xs font-bold uppercase tracking-wider">Pay now</span>
        <span className="font-display-tight text-3xl font-black">{rupee(amount)}</span>
      </div>

      <div className="rounded-3xl border-2 border-ink bg-paper p-5 shadow-neo-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]">Scan to pay</p>
          <Chip>Any UPI app</Chip>
        </div>

        {/* QR with scanner corners */}
        <div className="relative mx-auto mt-4 size-56">
          {(['left-0 top-0 border-l-4 border-t-4 rounded-tl-xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-xl',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl'] as const).map((c) => (
            <span key={c} aria-hidden="true" className={cn('absolute size-7 border-ink', c)} />
          ))}
          <div
            className={cn(
              'absolute inset-2.5 grid place-items-center overflow-hidden rounded-xl border-2 border-ink transition-colors',
              phase === 'paid' ? 'bg-mint' : 'bg-white',
            )}
          >
            {phase === 'creating' && (
              <div className="grid place-items-center gap-2 text-xs font-bold" role="status">
                <Loader2 className="size-7 animate-spin" strokeWidth={2.5} />
                Generating QR…
              </div>
            )}

            {(phase === 'waiting' || phase === 'expired') && qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr.imageUrl}
                alt={`UPI QR code to pay ${rupee(amount)}`}
                className={cn('size-full object-contain p-1.5 transition', phase === 'expired' && 'opacity-15 blur-[2px]')}
              />
            )}

            {phase === 'expired' && (
              <div className="absolute inset-0 grid place-items-center p-4 text-center">
                <div className="grid gap-3">
                  <p className="text-sm font-bold">QR expired</p>
                  <NeoButton size="sm" onClick={generate}>
                    <RefreshCw className="size-3.5" strokeWidth={3} /> New QR
                  </NeoButton>
                </div>
              </div>
            )}

            {phase === 'error' && (
              <div className="grid gap-3 p-4 text-center">
                <p className="text-sm font-bold">Couldn&apos;t create the QR</p>
                <NeoButton size="sm" onClick={generate}>
                  <RefreshCw className="size-3.5" strokeWidth={3} /> Try again
                </NeoButton>
              </div>
            )}

            {phase === 'paid' && (
              <div className="grid place-items-center gap-2 text-center" role="status" aria-live="polite">
                <span className="grid size-16 place-items-center rounded-full border-2 border-ink bg-paper shadow-neo-sm">
                  <Check className="size-8" strokeWidth={4} />
                </span>
                <p className="font-display-tight text-lg font-black">Payment received</p>
              </div>
            )}
          </div>
        </div>

        {/* live status */}
        <div className="mt-5 space-y-2" aria-live="polite">
          {live && (
            <>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 font-bold">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-ink/40" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-ink" />
                  </span>
                  Waiting for payment…
                </span>
                <span className={cn('font-bold tabular-nums', low && 'text-[#b3261e]')}>Expires in {fmt(left)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full border-2 border-ink bg-paper">
                <div className={cn('h-full transition-all duration-1000', low ? 'bg-pop' : 'bg-ink')} style={{ width: `${(left / total) * 100}%` }} />
              </div>
            </>
          )}
          {phase === 'paid' && <p className="text-center text-xs font-bold">Moving you to escrow…</p>}
        </div>
      </div>

      {live && (
        <>
          <ol className="grid grid-cols-3 gap-2 text-center text-[11px] leading-snug">
            {['Open any UPI app', 'Scan this QR', `Pay ${rupee(amount)}`].map((t, i) => (
              <li key={t} className="rounded-xl border-2 border-dashed border-ink/30 px-2 py-2">
                <span className="mb-1 grid size-5 place-items-center rounded-full border-2 border-ink bg-sun text-[10px] font-black mx-auto">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <p className="text-center text-xs text-ink/70">
            Keep this window open. You&apos;ll move on automatically as soon as the payment is received.
          </p>
          <p className="text-center text-xs text-ink/70 sm:hidden">
            On your phone? Screenshot this QR, then use &ldquo;scan from gallery&rdquo; in your UPI app.
          </p>
          {PAYMENT_MOCK && qr && (
            <button
              type="button"
              onClick={() => simulatePayment(qr.id)}
              className="w-full rounded-xl border-2 border-dashed border-ink/50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-ink/5"
            >
              Preview only · simulate payment
            </button>
          )}
        </>
      )}

      <div className="flex gap-3">
        <NeoButton type="button" tone="paper" onClick={onBack} disabled={phase === 'paid'}>
          Back
        </NeoButton>
        <NeoButton type="button" className="flex-1" onClick={manualCheck} disabled={!live || checking}>
          {checking ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={3} /> Checking…
            </>
          ) : (
            "I've paid · check now"
          )}
        </NeoButton>
      </div>

      {live && checking && (
        <p role="status" className="flex items-center justify-center gap-2 text-xs font-bold">
          <Loader2 className="size-4 animate-spin" strokeWidth={3} />
          Checking your payment…
        </p>
      )}
      {live && notYet && !checking && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border-2 border-[#b3261e] bg-[#fdecea] px-3 py-2.5 text-xs font-bold leading-snug text-[#b3261e]"
        >
          <CircleAlert className="mt-px size-4 shrink-0" strokeWidth={3} aria-hidden="true" />
          <span>Not received yet. Banks can take a few seconds, we&apos;ll keep checking.</span>
        </div>
      )}
    </div>
  )
}
