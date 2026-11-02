'use client'

import { BadgeCheck, Check, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { OFFICIAL_PLANS, formatINR, round2, type PoolDraft } from '@/lib/pool'
import { cn } from '@/lib/utils'
import { BrandMark, Chip, Eyebrow } from './neo'
import { StepHeader } from './step-header'

export function StepSelect({
  draft,
  onPickOfficial,
  onPickCustom,
  onModeOfficial,
}: {
  draft: PoolDraft
  onPickOfficial: (id: string) => void
  onPickCustom: () => void
  onModeOfficial: () => void
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const plans = OFFICIAL_PLANS.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
  )
  const customActive = draft.mode === 'custom'

  return (
    <section className="flex flex-col gap-8" aria-labelledby="step-heading">
      <StepHeader
        kicker="Share a plan"
        title={
          <>
            What are you <span className="rounded-2xl bg-sun px-2">splitting</span>?
          </>
        }
        description="Pick an official plan with locked pricing, or set up your own custom split."
      />

      <div
        role="tablist"
        aria-label="Plan type"
        className="grid grid-cols-2 gap-1 rounded-full border-2 border-ink bg-paper p-1"
      >
        {[
          { k: 'official', label: 'Official plans', hint: 'Locked pricing', Icon: BadgeCheck },
          { k: 'custom', label: 'Custom split', hint: 'Your own price', Icon: SlidersHorizontal },
        ].map(({ k, label, hint, Icon }) => {
          const active = (k === 'custom') === customActive
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => (k === 'custom' ? onPickCustom() : onModeOfficial())}
              className={cn(
                'flex h-14 items-center justify-center gap-2.5 rounded-full px-3 text-left transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                active ? 'bg-sun' : 'hover:bg-cream',
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold">{label}</span>
                <span className="hidden text-[11px] font-medium text-stone sm:block">{hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      {customActive ? (
        <div className="flex items-start gap-4 rounded-3xl border-2 border-ink bg-lilac p-5 hard-shadow">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-paper">
            <SlidersHorizontal className="size-5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-lg font-black">Custom split</p>
            <p className="text-sm leading-relaxed text-ink/75">
              Any subscription. Set your own price, duration and member count on the next step.
            </p>
          </div>
        </div>
      ) : (
        <>
        <div className="flex h-12 items-center gap-3 rounded-full border-2 border-ink bg-paper px-5 focus-within:hard-shadow">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <label htmlFor="plan-search" className="sr-only">
            Search plans
          </label>
          <input
            id="plan-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Netflix, Spotify, Canva…"
            className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-ink/40"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Eyebrow>/ Official plans</Eyebrow>
            <span className="font-mono text-[11px] font-bold text-stone">{plans.length} available</span>
          </div>

          {plans.length === 0 ? (
            <p className="rounded-3xl border-2 border-dashed border-ink/40 p-8 text-center text-sm text-stone">
              No plans match &ldquo;{query}&rdquo;. Try a custom split below.
            </p>
          ) : (
            <div role="radiogroup" aria-label="Official plans" className="grid gap-3 sm:grid-cols-2">
              {plans.map((p) => {
                const active = draft.mode === 'official' && draft.officialId === p.id
                const seats = p.memberLimit + 1
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onPickOfficial(p.id)}
                    className={cn(
                      'group relative flex flex-col gap-4 rounded-3xl border-2 border-ink p-4 text-left transition-all',
                      'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink',
                      active
                        ? 'bg-sun-soft hard-shadow'
                        : 'bg-paper hover:-translate-x-0.5 hover:-translate-y-0.5 hover:hard-shadow',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BrandMark src={p.logo} alt="" tint={p.tint} />
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-black leading-tight">{p.name}</p>
                        <p className="mt-0.5 text-xs text-stone">{p.tier}</p>
                      </div>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink transition-colors',
                          active ? 'bg-ink text-paper' : 'bg-paper text-transparent',
                        )}
                      >
                        <Check className="size-3.5" strokeWidth={3.5} />
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-2 border-t-2 border-dashed border-ink/20 pt-3">
                      <p>
                        <span className="font-display text-xl font-black">{formatINR(p.price)}</span>
                        <span className="text-xs text-stone"> /mo</span>
                      </p>
                      <Chip tone={active ? 'paper' : 'mint'}>
                        {formatINR(round2(p.price / seats))} · {seats} seats
                      </Chip>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        </>
      )}
    </section>
  )
}
