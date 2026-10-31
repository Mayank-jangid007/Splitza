'use client'

import { useState, type ReactNode } from 'react'
import type { Pool } from '@/lib/dashboard/types'
import { getDaysElapsed } from '@/lib/dashboard/pool-utils'

const MONO = "font-[family-name:var(--font-space-mono)]"
const SECTION = `${MONO} text-xs font-bold uppercase tracking-[0.12em] text-[#6b6558]`

// ── Copy button ────────────────────────────────────────────────
function CopyBtn({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value) } catch {}
    setDone(true)
    setTimeout(() => setDone(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={`${MONO} shrink-0 rounded-full border-2 border-[#151515] px-3 py-1.5 text-[11px] font-bold active:translate-x-px active:translate-y-px ${done ? 'bg-[#8de89a]' : 'bg-white'}`}
    >
      {done ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

// ── Field row ──────────────────────────────────────────────────
function Field({ label, children, actions }: { label: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#151515] bg-white px-4 py-3">
      <div className="min-w-0">
        <p className={`${MONO} text-[10px] font-bold uppercase tracking-wider text-[#6b6558]`}>{label}</p>
        <div className="mt-0.5 truncate text-base font-bold">{children}</div>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}

// ── Credentials section ────────────────────────────────────────
function Credentials({ email, password }: { email: string; password: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <h3 className={SECTION}>Your login info</h3>
      <Field label="ID / Email" actions={<CopyBtn value={email} label="email" />}>
        {email}
      </Field>
      <Field
        label="Password"
        actions={
          <>
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-pressed={show}
              className={`${MONO} rounded-full border-2 border-[#151515] bg-white px-3 py-1.5 text-[11px] font-bold active:translate-x-px active:translate-y-px`}
            >
              {show ? 'Hide' : 'Show'}
            </button>
            <CopyBtn value={password} label="password" />
          </>
        }
      >
        <span className={MONO}>{show ? password : '•'.repeat(9)}</span>
      </Field>
    </div>
  )
}

// ── Meta section (cost + group) ────────────────────────────────
function Meta({ pool }: { pool: Pool }) {
  const open = pool.capacity - pool.filledSeats
  const isProrated = pool.totalDays > 0 && pool.totalDays !== pool.planMonths * 30
  const monthly = Math.round(pool.monthlyPlanCost ?? (pool.pricePerSeat * pool.capacity * 30) / Math.max(1, pool.totalDays))
  return (
    <div className="flex flex-col gap-3">
    <div className="grid grid-cols-2 divide-x-2 divide-[#151515] overflow-hidden rounded-[24px] border-[2.5px] border-[#151515] bg-white shadow-[4px_4px_0_0_#151515]">
      <div className="flex flex-col gap-1.5 p-4">
        <h3 className={SECTION}>Your cost</h3>
        <p className={`${MONO} text-xl font-bold leading-tight`}>
          ₹{pool.pricePerSeat.toLocaleString('en-IN')}
          <span className="text-xs font-medium text-[#6b6558]">
            {pool.totalDays !== pool.planMonths * 30 ? ' / term' : ' / month'}
          </span>
        </p>
        <span className={`${MONO} inline-flex w-fit items-center gap-1 rounded-full border-2 border-[#151515] bg-[#8de89a] px-2 py-0.5 text-[10px] font-bold`}>
          ✓ Paid · Escrow
        </span>
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <h3 className={SECTION}>Group</h3>
        <p className="text-xl font-extrabold leading-tight">
          {pool.filledSeats}/{pool.capacity}
          <span className="text-xs font-medium text-[#6b6558]"> seats filled</span>
        </p>
        <div className="flex gap-1.5" aria-label={`${open} seat${open !== 1 ? 's' : ''} open`}>
          {Array.from({ length: pool.capacity }, (_, i) =>
            i < pool.filledSeats ? (
              <span key={i} className="grid h-7 w-7 place-items-center rounded-full bg-[#151515]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </span>
            ) : (
              <span key={i} className="h-7 w-7 rounded-full border-2 border-dashed border-[#151515]" />
            )
          )}
        </div>
      </div>
    </div>
      {isProrated && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-dashed border-[#151515]/50 bg-white/70 px-3.5 py-2.5">
          <span className={`${MONO} rounded-full border-2 border-[#151515] bg-[#cdb0ea] px-2 py-0.5 text-[10px] font-bold`}>Pro-rated</span>
          <span className={`${MONO} text-xs font-bold text-[#3d3a32]`}>
            ₹{monthly} ÷ 30 × {pool.totalDays} days ÷ {pool.capacity} seats = ₹{Math.round(pool.pricePerSeat)}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Timeline section ───────────────────────────────────────────
function Timeline({ pool }: { pool: Pool }) {
  const elapsed = pool.totalDays > 0 ? ((pool.totalDays - pool.daysLeft) / pool.totalDays) * 100 : 0
  return (
    <div className="flex flex-col gap-3">
      <h3 className={SECTION}>Pool timeline</h3>
      <div
        className="h-[18px] overflow-hidden rounded-full border-[2.5px] border-[#151515] bg-white"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={pool.totalDays}
        aria-valuenow={pool.totalDays - pool.daysLeft}
      >
        <div className="h-full bg-[#151515]" style={{ width: `${elapsed}%` }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-lg font-extrabold">
          {pool.daysLeft} days left{' '}
          <span className="font-medium text-[#6b6558]">until the pool ends</span>
        </p>
        <p className={`${MONO} text-xs font-bold text-[#3d3a32]`}>Ends on {pool.endsOn}</p>
      </div>
    </div>
  )
}

// ── Report issue section ───────────────────────────────────────
function ReportIssue() {
  const [sent, setSent] = useState(false)
  const onReport = () => {
    // TODO: call API to pause host payout + notify host
    setSent(true)
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[#151515]/40 pt-4">
      <p className="text-sm font-medium text-[#4a463d]">
        {sent
          ? 'Reported. We have alerted the host and paused the next payout to them until it is fixed.'
          : 'Having trouble logging in?'}
      </p>
      {!sent && (
        <button
          type="button"
          onClick={onReport}
          className={`${MONO} rounded-full border-2 border-[#151515] bg-white px-4 py-2 text-xs font-bold active:translate-x-px active:translate-y-px`}
        >
          Report access issue
        </button>
      )}
    </div>
  )
}

// ── Main card ──────────────────────────────────────────────────
interface CoHostCardProps {
  pool: Pool
  /** Credentials from the backend — demo placeholders until real API */
  credentials?: { email: string; password: string }
}

export function CoHostCard({ pool, credentials }: CoHostCardProps) {
  const email = credentials?.email ?? 'Contact host for access'
  const password = credentials?.password ?? '••••••••••'

  return (
    <div className="mx-auto w-full overflow-hidden rounded-[36px] border-[2.5px] border-[#151515] bg-[#fbf6ee] shadow-[6px_6px_0_0_#151515]">
      {/* Header */}
      <header className="flex items-start gap-4 border-b-[2.5px] border-[#151515] bg-[#f7c85a] p-6">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-[2.5px] border-[#151515] bg-white" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#151515" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="12" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[28px] font-extrabold leading-none tracking-[-0.03em]">{pool.name}</h2>
          <p className="mt-2 text-base font-medium text-[#4a463d]">Shared by host {pool.host}</p>
          <span className={`${MONO} mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-[#151515] bg-[#8de89a] px-3 py-1 text-xs font-bold`}>
            <span aria-hidden="true">●</span> Active member
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col gap-8 p-6">
        <Credentials email={email} password={password} />
        <Meta pool={pool} />
        <Timeline pool={pool} />
        <ReportIssue />
      </div>
    </div>
  )
}
