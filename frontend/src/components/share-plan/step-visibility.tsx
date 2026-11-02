'use client'

import { Check, Globe, Lock, type LucideIcon } from 'lucide-react'
import type { PoolDraft, Visibility } from '@/lib/pool'
import { cn } from '@/lib/utils'
import { Chip } from './neo'
import { StepHeader } from './step-header'

const OPTIONS: {
  value: Visibility
  title: string
  body: string
  tag: string
  Icon: LucideIcon
  tint: string
}[] = [
  {
    value: 'public',
    title: 'Public',
    body: 'Listed in the marketplace. Anyone can find and join your pool.',
    tag: 'Fills faster',
    Icon: Globe,
    tint: 'bg-mint',
  },
  {
    value: 'private',
    title: 'Private',
    body: 'Hidden from search. Only people with your invite link can join.',
    tag: 'Invite only',
    Icon: Lock,
    tint: 'bg-bubblegum',
  },
]

export function StepVisibility({ draft, update }: { draft: PoolDraft; update: (p: Partial<PoolDraft>) => void }) {
  return (
    <section className="flex flex-col gap-8" aria-labelledby="step-heading">
      <StepHeader
        kicker="Visibility"
        title="Who can join?"
        description="Go public to fill seats quickly, or keep it private for friends and family."
      />

      <div role="radiogroup" aria-label="Pool visibility" className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((o) => {
          const active = draft.visibility === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => update({ visibility: o.value })}
              className={cn(
                'flex flex-col gap-6 rounded-3xl border-2 border-ink p-6 text-left transition-all',
                'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink',
                active ? 'bg-paper hard-shadow-lg' : 'bg-paper/60 hover:bg-paper hover:hard-shadow',
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn('grid size-14 place-items-center rounded-2xl border-2 border-ink', o.tint)}>
                  <o.Icon className="size-6" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-7 place-items-center rounded-full border-2 border-ink',
                    active ? 'bg-ink text-paper' : 'bg-paper text-transparent',
                  )}
                >
                  <Check className="size-4" strokeWidth={3.5} />
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-xl font-black">{o.title}</span>
                  <Chip tone={active ? 'sun' : 'paper'}>{o.tag}</Chip>
                </div>
                <p className="text-sm leading-relaxed text-stone">{o.body}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
