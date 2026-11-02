'use client'

import { AlertTriangle, PencilLine } from 'lucide-react'
import { formatINR, summarize, type PoolDraft } from '@/lib/pool'
import { Card, Eyebrow } from './neo'
import { PoolCard } from './pool-card'
import { StepHeader } from './step-header'

function mask(value: string) {
  const [name, bank] = value.split('@')
  if (!name || !bank) return value
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(2, name.length - 2))}@${bank}`
}

export function StepReview({
  draft,
  error,
  onEdit,
}: {
  draft: PoolDraft
  error: string | null
  onEdit: (step: number) => void
}) {
  const s = summarize(draft)
  if (!s) return null

  const rows: { label: string; value: string; step: number }[] = [
    { label: 'Plan', value: s.tier ? `${s.name} · ${s.tier}` : s.name, step: 0 },
    { label: 'Price', value: `${formatINR(s.monthlyPrice)} / month`, step: 1 },
    { label: 'Duration', value: s.durationLabel, step: 1 },
    { label: 'Seats', value: `${s.memberLimit} members + you`, step: 1 },
    { label: 'Visibility', value: draft.visibility === 'public' ? 'Public' : 'Private', step: 2 },
    { label: 'Access', value: draft.credentialMethod === 'login' ? 'Login details' : 'Invite link', step: 3 },
    { label: 'Payout', value: mask(draft.upi), step: 4 },
  ]

  return (
    <section className="flex flex-col gap-8" aria-labelledby="step-heading">
      <StepHeader
        kicker="Review"
        title="Ready to launch?"
        description="Double-check everything. You can still edit any step before your pool goes live."
      />

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border-2 border-ink bg-tomato/15 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-tomato" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold">{"Couldn't launch your pool"}</p>
            <p className="text-xs text-ink/70">{error}</p>
          </div>
        </div>
      )}

      <PoolCard summary={s} visibility={draft.visibility} className="lg:hidden" />

      <Card>
        <div className="flex items-center justify-between border-b-2 border-ink px-5 py-3">
          <Eyebrow>/ Summary</Eyebrow>
          <span className="font-mono text-[11px] font-bold text-stone">{rows.length} items</span>
        </div>
        <dl className="divide-y-2 divide-dashed divide-ink/15 px-5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 py-3">
              <dt className="w-24 shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-stone">{r.label}</dt>
              <dd className="min-w-0 flex-1 truncate text-sm font-bold">{r.value}</dd>
              <button
                type="button"
                onClick={() => onEdit(r.step)}
                aria-label={`Edit ${r.label.toLowerCase()}`}
                className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-transparent hover:border-ink hover:bg-sun-soft"
              >
                <PencilLine className="size-3.5" />
              </button>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between rounded-b-[22px] border-t-2 border-ink bg-sun px-5 py-4">
          <span className="text-sm font-bold">Each seat pays</span>
          <span className="font-display text-2xl font-black">{formatINR(s.perSeat)}</span>
        </div>
      </Card>
    </section>
  )
}
