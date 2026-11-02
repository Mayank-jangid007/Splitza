'use client'

import { Check, Copy, Plus } from 'lucide-react'
import { useState } from 'react'
import { type CreatePoolResult, type PlanSummary, type Visibility } from '@/lib/pool'
import { Button, Eyebrow, Illo, Squiggle, buttonClass } from './neo'
import { PoolCard } from './pool-card'

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

  return (
    <section
      aria-labelledby="step-heading"
      className="mx-auto grid max-w-5xl animate-rise items-center gap-10 py-6 lg:grid-cols-[1fr_380px] lg:gap-16"
    >
      <div className="flex flex-col gap-6">
        <Illo
          src="/illustrations/launch.png"
          tint="bg-lilac"
          className="aspect-[4/3] w-full max-w-sm hard-shadow-lg"
          priority
        />
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border-2 border-ink bg-mint px-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
            <Check className="size-3.5" strokeWidth={3.5} aria-hidden="true" />
            {result.status}
          </span>
          <Squiggle />
        </div>
        <h1
          id="step-heading"
          tabIndex={-1}
          className="text-balance font-display text-5xl font-black leading-[0.95] tracking-tight outline-none sm:text-6xl"
        >
          Your pool is live.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-stone">
          {visibility === 'public'
            ? `It's listed in the marketplace now. ${result.openSeats} open seats are waiting for members.`
            : `Share the invite link below. ${result.openSeats} open seats are waiting for your people.`}
        </p>

        {result.inviteUrl && (
          <div className="flex flex-col gap-2">
            <Eyebrow>/ Invite link</Eyebrow>
            <div className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper p-1.5 pl-5">
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{result.inviteUrl}</span>
              <Button tone={copied ? 'ink' : 'sun'} size="sm" onClick={copy} className="shadow-none">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={onBack} className={buttonClass('ink', 'lg')}>
            Go to my pools
          </button>
          <Button tone="paper" size="lg" onClick={onReset}>
            <Plus className="size-4" strokeWidth={3} />
            Share another
          </Button>
        </div>
      </div>

      <PoolCard summary={summary} visibility={visibility} className="rotate-1" />
    </section>
  )
}
