'use client'

import {
  CalendarClock,
  Check,
  Copy,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Plus,
  Receipt,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  credentialsFor,
  isValidUpi,
  planDurationLabel,
  rupee,
  type MarketPool,
} from '@/lib/splitza'
import { poolsApi, type PoolCredentials } from '@/lib/api'
import { Chip, Field, NeoButton, NeoDialog, PlatformLogo, inputClass } from './ui'

type Step = 'review' | 'pay' | 'lock' | 'creds'
const STEP_ORDER: Step[] = ['review', 'pay', 'lock', 'creds']
const STEP_LABEL: Record<Step, string> = {
  review: 'Review',
  pay: 'Pay',
  lock: 'Escrow',
  creds: 'Access',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function JoinFlow({
  pool,
  onClose,
  onComplete,
  onDone,
}: {
  pool: MarketPool | null
  onClose: () => void
  onComplete?: (pool: MarketPool) => void
  onDone?: () => void
}) {
  const [locked, setLocked] = useState(false)
  return (
    <NeoDialog
      open={pool !== null}
      onOpenChange={(o) => !o && onClose()}
      title="Join pool"
      eyebrow="Escrow flow"
      accent="bg-sun"
      maxWidth="max-w-lg"
      locked={locked}
    >
      {pool && (
        <JoinBody
          key={pool.id}
          pool={pool}
          onClose={onClose}
          onComplete={onComplete}
          onDone={onDone}
          onLockChange={setLocked}
        />
      )}
    </NeoDialog>
  )
}

function JoinBody({
  pool,
  onClose,
  onComplete,
  onDone,
  onLockChange,
}: {
  pool: MarketPool
  onClose: () => void
  onComplete?: (pool: MarketPool) => void
  onDone?: () => void
  onLockChange: (locked: boolean) => void
}) {
  const [step, setStep] = useState<Step>('review')
  const [upi, setUpi] = useState('')
  const [touched, setTouched] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [copied, setCopied] = useState<'user' | 'pass' | null>(null)
  const [joinedCreds, setJoinedCreds] = useState<PoolCredentials | null>(null)
  const [alreadyMember, setAlreadyMember] = useState(false)
  const fallbackCreds = credentialsFor(pool)
  const creds = {
    username: joinedCreds?.username ?? fallbackCreds.username,
    password: joinedCreds?.password ?? fallbackCreds.password,
  }
  const days = pool.durationDays ?? pool.durationMonths * 30
  const planCost = pool.pricePerSeat * pool.seats
  const openSeats = Math.max(pool.seats - pool.filled, 0)
  const upiOk = isValidUpi(upi)
  const fullMonth = days === pool.durationMonths * 30

  useEffect(() => {
    onLockChange(step === 'lock')
    return () => onLockChange(false)
  }, [step, onLockChange])

  useEffect(() => {
    if (step !== 'lock') return
    let cancelled = false
    const t = setTimeout(async () => {
      if (UUID_RE.test(pool.id)) {
        try {
          const myRes = await poolsApi.getMyPools()
          const already = myRes.ok && myRes.data.some((p) => p.id === pool.id)
          if (already) {
            if (!cancelled) setAlreadyMember(true)
            try {
              const credsRes = await poolsApi.getCredentials(pool.id)
              if (!cancelled && credsRes.ok && credsRes.data) setJoinedCreds(credsRes.data)
            } catch {
              // fallback credentials are shown
            }
          } else {
            const res = await poolsApi.join(pool.id)
            if (!cancelled && res.ok && res.data?.credentials) {
              setJoinedCreds(res.data.credentials)
            } else if (!cancelled) {
              try {
                const credsRes = await poolsApi.getCredentials(pool.id)
                if (!cancelled && credsRes.ok && credsRes.data) setJoinedCreds(credsRes.data)
              } catch {
                // fallback credentials are shown
              }
            }
          }
        } catch {
          // fallback credentials are shown
        }
      }
      if (!cancelled) {
        onComplete?.(pool)
        setStep('creds')
      }
    }, 1200)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const copy = async (kind: 'user' | 'pass') => {
    try {
      await navigator.clipboard.writeText(kind === 'user' ? creds.username : creds.password)
    } catch {
      // clipboard may be unavailable in sandboxed frames
    }
    setCopied(kind)
    setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="space-y-6">
      <ol className="grid grid-cols-4 gap-2" aria-label="Join progress">
        {STEP_ORDER.map((s, i) => {
          const idx = STEP_ORDER.indexOf(step)
          return (
            <li key={s} aria-current={i === idx ? 'step' : undefined} className="space-y-1.5">
              <div
                className={cn(
                  'h-2.5 rounded-full border-2 border-ink',
                  i < idx && 'bg-ink',
                  i === idx && 'bg-sun',
                  i > idx && 'bg-paper',
                )}
              />
              <p className={cn('text-[10px] font-bold uppercase tracking-wider', i > idx && 'text-ink/45')}>
                {i + 1}. {STEP_LABEL[s]}
              </p>
            </li>
          )
        })}
      </ol>

      {step === 'review' && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <PlatformLogo name={pool.name} size={60} />
            <div className="min-w-0">
              <h3 className="font-display-tight text-xl font-black">{pool.name}</h3>
              <p className="text-xs text-ink/70">Host · {pool.host}</p>
              <div className="mt-2 flex gap-2">
                <Chip tone="mint">{pool.trust.toFixed(1)} trust</Chip>
                <Chip>{openSeats} seats open</Chip>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <StatCard
              tone="bg-paper col-span-2 sm:col-span-1"
              Icon={Receipt}
              label="Plan cost"
              value={inr(planCost)}
              sub={planDurationLabel(pool)}
            />
            <StatCard
              tone="bg-mint"
              Icon={Wallet}
              label="Your split"
              value={inr(pool.pricePerSeat)}
              sub="per person"
            />
            <StatCard
              tone="bg-pop"
              Icon={CalendarClock}
              label="Days left"
              value={`${days} days`}
              sub={`of ${days}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border-2 border-dashed border-ink bg-sun/20 px-4 py-3">
            <Chip tone="lav" className="border-sun py-1 text-[11px] normal-case tracking-normal">
              Pro-rated
            </Chip>
            <span className="text-xs font-bold text-[#7a2f0a]">
              ₹{planCost.toLocaleString('en-IN')} ÷ {days} days ÷ {pool.seats} seats ={' '}
              {rupee(pool.pricePerSeat)}
            </span>
          </div>

          <SeatsCard host={pool.host} seats={pool.seats} filled={pool.filled} open={openSeats} />

          <section className="rounded-3xl border-2 border-ink bg-paper p-4 shadow-neo-sm">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/70">Plan details</h4>
              <Chip tone="lav" className="normal-case tracking-normal">
                Set by {pool.host}
              </Chip>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              A {planDurationLabel(pool)} shared plan hosted by {pool.host}
              {pool.host.endsWith('.') ? '' : '.'} {openSeats}{' '}
              {openSeats === 1 ? 'seat' : 'seats'} available.
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {PLAN_RULES.map((rule, i) => (
                <li key={rule} className="flex items-center gap-2.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun text-[11px] font-black">
                    {i + 1}
                  </span>
                  {rule}
                </li>
              ))}
            </ol>
          </section>

          <NeoButton className="w-full" size="lg" tone="ink" onClick={() => setStep('pay')}>
            Join Pool · {inr(pool.pricePerSeat)}
            {fullMonth && pool.durationMonths === 1 ? '/mo' : ''}
          </NeoButton>
          <div className="space-y-1 text-center text-[11px] text-ink/60">
            <p className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" strokeWidth={3} />
              Escrow-held. UPI payouts. Every seat verified by bot.
            </p>
            <p>By joining you agree to the plan rules above.</p>
          </div>
        </div>
      )}

      {step === 'pay' && (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            setTouched(true)
            if (upiOk) setStep('lock')
          }}
          noValidate
        >
          <div className="flex items-center justify-between rounded-2xl border-2 border-ink bg-sun p-4">
            <span className="text-xs font-bold uppercase tracking-wider">Pay now</span>
            <span className="font-display-tight text-3xl font-black">{rupee(pool.pricePerSeat)}</span>
          </div>
          <Field
            label="Your UPI ID"
            htmlFor="join-upi"
            hint="Example: david@okbank"
            error={touched && !upiOk ? 'Enter a valid UPI ID like name@bank to continue.' : undefined}
          >
            <input
              id="join-upi"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="name@bank"
              autoComplete="off"
              aria-invalid={touched && !upiOk}
              className={inputClass}
            />
          </Field>
          <div className="flex gap-3">
            <NeoButton type="button" tone="paper" onClick={() => setStep('review')}>
              Back
            </NeoButton>
            <NeoButton type="submit" className="flex-1">
              Pay {rupee(pool.pricePerSeat)}
            </NeoButton>
          </div>
        </form>
      )}

      {step === 'lock' && (
        <div className="space-y-5 py-4 text-center" role="status" aria-live="polite">
          <div className="relative mx-auto grid size-24 place-items-center">
            <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-ink bg-mint/60" />
            <span className="relative grid size-20 place-items-center rounded-full border-2 border-ink bg-sun shadow-neo">
              <Lock className="size-8" strokeWidth={2.5} />
            </span>
          </div>
          <div>
            <h3 className="font-display-tight text-2xl font-black">Locking your payment</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink/75">
              Please wait and don&apos;t close this page. We&apos;re moving {rupee(pool.pricePerSeat)} into escrow.
            </p>
          </div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="size-4 animate-spin" strokeWidth={3} /> Verifying payment
          </p>
        </div>
      )}

      {step === 'creds' && (
        <div className="space-y-5">
          <div className="rounded-2xl border-2 border-ink bg-mint p-4">
            <p className="font-display-tight text-xl font-black">
              {alreadyMember ? 'Already a member' : 'Payment locked'}
            </p>
            <p className="mt-1 text-xs">
              {alreadyMember
                ? `You already have a seat in ${pool.name}. Here are your login details.`
                : `Verified. Here are your login details for ${pool.name}.`}
            </p>
          </div>
          <div className="space-y-3">
            <CredRow
              label="Username"
              value={creds.username}
              copied={copied === 'user'}
              onCopy={() => copy('user')}
            />
            <CredRow
              label="Password"
              value={reveal ? creds.password : '•'.repeat(creds.password.length)}
              copied={copied === 'pass'}
              onCopy={() => copy('pass')}
              extra={
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  aria-label={reveal ? 'Hide password' : 'Show password'}
                  className="neo-press grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper shadow-neo-sm outline-none focus-visible:ring-4 focus-visible:ring-ink/30"
                >
                  {reveal ? <EyeOff className="size-4" strokeWidth={3} /> : <Eye className="size-4" strokeWidth={3} />}
                </button>
              }
            />
          </div>
          <NeoButton
            className="w-full"
            size="lg"
            tone="ink"
            onClick={() => {
              onDone?.()
              onClose()
            }}
          >
            Go to my pools
          </NeoButton>
        </div>
      )}
    </div>
  )
}

const PLAN_RULES = ['Pay on time each billing cycle.', 'Do not share your credentials outside the pool.']

const inr = (n: number) => `INR ${n.toLocaleString('en-IN')}`

function StatCard({
  tone,
  Icon,
  label,
  value,
  sub,
}: {
  tone: string
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
  sub: string
}) {
  return (
    <div className={cn('min-w-0 rounded-2xl border-2 border-ink p-3 shadow-neo-sm', tone)}>
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
        <Icon className="size-3.5 shrink-0" strokeWidth={2.5} />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-2 truncate font-display-tight text-base font-black">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-ink/60">{sub}</p>
    </div>
  )
}

function SeatsCard({
  host,
  seats,
  filled,
  open,
}: {
  host: string
  seats: number
  filled: number
  open: number
}) {
  return (
    <section className="rounded-3xl border-2 border-ink bg-paper p-4 shadow-neo-sm">
      <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/70">Seats available</h4>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="font-display-tight text-3xl font-black">
          {open} <span className="text-base font-bold text-ink/60">of {seats} left</span>
        </p>
        <Chip tone="sun" className="py-1 text-xs normal-case tracking-normal">
          {open} {open === 1 ? 'seat' : 'seats'} open
        </Chip>
      </div>
      <ul className="mt-4 grid grid-cols-4 gap-y-4">
        {Array.from({ length: seats }, (_, i) => {
          const kind = i === 0 ? 'host' : i < filled ? 'taken' : 'open'
          return (
            <li key={i} className="flex min-w-0 flex-col items-center gap-1.5">
              {kind === 'host' && (
                <span className="relative">
                  <span className="grid size-12 place-items-center rounded-full border-2 border-ink bg-sun font-display text-base font-black">
                    {host.charAt(0).toLowerCase()}
                  </span>
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-ink bg-paper">
                    <Crown className="size-3" strokeWidth={2.5} />
                  </span>
                </span>
              )}
              {kind === 'taken' && (
                <span className="grid size-12 place-items-center rounded-full border-2 border-ink bg-lav-soft">
                  <User className="size-5" strokeWidth={2.5} />
                </span>
              )}
              {kind === 'open' && (
                <span className="grid size-12 place-items-center rounded-full border-2 border-dashed border-ink/60 bg-cream text-ink/60">
                  <Plus className="size-4" strokeWidth={2.5} />
                </span>
              )}
              <span
                className={cn(
                  'max-w-full truncate text-[11px] font-bold',
                  kind === 'open' ? 'text-ink/45' : 'text-ink',
                )}
              >
                {kind === 'host' ? host : kind === 'taken' ? 'Joined' : 'Open'}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function CredRow({
  label,
  value,
  onCopy,
  copied,
  extra,
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
  extra?: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em]">{label}</p>
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate rounded-xl border-2 border-ink bg-paper px-4 py-3 text-sm font-bold shadow-neo-sm">
          {value}
        </p>
        {extra}
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className={cn(
            'neo-press grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink shadow-neo-sm outline-none focus-visible:ring-4 focus-visible:ring-ink/30',
            copied ? 'bg-mint' : 'bg-sun',
          )}
        >
          {copied ? <Check className="size-4" strokeWidth={4} /> : <Copy className="size-4" strokeWidth={3} />}
        </button>
      </div>
    </div>
  )
}
