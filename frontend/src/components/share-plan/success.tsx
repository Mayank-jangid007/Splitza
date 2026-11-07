'use client'

import Image from 'next/image'
import { Check, Copy, Globe, Lock, Plus } from 'lucide-react'
import { useState } from 'react'
import { formatINR, type CreatePoolResult, type PlanSummary, type Visibility } from '@/lib/pool'
import { Button, Chip, buttonClass } from './neo'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0]).toUpperCase()
}

export function Success({
  result,
  summary,
  visibility,
  onReset,
  onBack,
}: {
  result: CreatePoolResult
  summary: PlanSummary
  visibility: Visibility
  onReset: () => void
  onBack: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!result.inviteUrl) return
    try {
      await navigator.clipboard.writeText(result.inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const seatsWord = result.openSeats === 1 ? 'seat is' : 'seats are'
  const rows: [string, string][] = [
    ['Seats', `1 of ${summary.totalSeats} filled`],
    ['Per seat', formatINR(result.pricePerSeat)],
    ['Duration', summary.durationLabel],
    ['Total', formatINR(result.totalCost)],
  ]

  return (
    <section aria-labelledby="step-heading" className="flex max-w-xl animate-rise flex-col gap-8 py-6">
      <div className="flex flex-col gap-4">
        <span className="grid size-12 place-items-center rounded-full border-2 border-ink bg-mint">
          <Check className="size-6" strokeWidth={3.5} aria-hidden="true" />
        </span>
        <h1
          id="step-heading"
          tabIndex={-1}
          className="text-balance font-display text-4xl font-black leading-tight tracking-tight outline-none sm:text-5xl"
        >
          Your pool is live.
        </h1>
        <p className="text-sm leading-relaxed text-stone">
          {visibility === 'public'
            ? `It's listed in the marketplace. ${result.openSeats} open ${seatsWord} waiting for members.`
            : `Share the invite link below. ${result.openSeats} open ${seatsWord} waiting for your people.`}
        </p>
      </div>

      <div className="rounded-2xl border-2 border-ink bg-paper">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink bg-sun">
              {summary.logo ? (
                <Image src={summary.logo} alt="" width={22} height={22} className="size-5 object-contain" />
              ) : (
                <span className="font-display text-xs font-black">{initials(summary.name)}</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-black leading-tight">{summary.name}</p>
              <p className="text-xs text-stone">Host · You</p>
            </div>
          </div>
          <Chip>
            {visibility === 'public' ? <Globe className="size-3" /> : <Lock className="size-3" />}
            {visibility}
          </Chip>
        </div>
        <dl className="border-t-2 border-dashed border-ink/25">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-3 last:border-b-0">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-stone">{k}</dt>
              <dd className="text-sm font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {result.inviteUrl && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-stone">Invite link</span>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-paper p-1.5 pl-4">
            <span className="min-w-0 flex-1 truncate text-sm">{result.inviteUrl}</span>
            <Button tone={copied ? 'ink' : 'sun'} size="sm" onClick={copy} className="shadow-none">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className={buttonClass('ink', 'lg')}>
          Go to my pools
        </button>
        <Button tone="paper" size="lg" onClick={onReset}>
          <Plus className="size-4" strokeWidth={3} />
          Share another
        </Button>
      </div>
    </section>
  )
}
