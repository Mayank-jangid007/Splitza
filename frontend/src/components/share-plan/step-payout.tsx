'use client'

import { BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { validateUpi, type PoolDraft } from '@/lib/pool'
import { cn } from '@/lib/utils'
import { Field, TextInput } from './neo'
import { StepHeader } from './step-header'

const HANDLES = ['@oksbi', '@okhdfcbank', '@ybl', '@paytm']

export function StepPayout({ draft, update }: { draft: PoolDraft; update: (p: Partial<PoolDraft>) => void }) {
  const [touched, setTouched] = useState(false)
  const error = touched ? validateUpi(draft.upi) : null
  const valid = !validateUpi(draft.upi)

  function applyHandle(handle: string) {
    const name = draft.upi.split('@')[0]
    update({ upi: `${name}${handle}` })
    setTouched(true)
  }

  return (
    <section className="flex flex-col gap-8" aria-labelledby="step-heading">
      <StepHeader
        kicker="Payout"
        title="Get paid back."
        description="Member payments are released straight to your UPI ID once they join."
      />

      <div className="flex flex-col gap-6">
        <Field label="UPI ID" htmlFor="upi-id" error={error} hint="Format: name@bank">
          <TextInput
            id="upi-id"
            value={draft.upi}
            onChange={(e) => update({ upi: e.target.value.trim() })}
            onBlur={() => setTouched(true)}
            placeholder="yourname@oksbi"
            autoComplete="off"
            spellCheck={false}
            invalid={!!error}
            suffix={valid ? <BadgeCheck className="size-5 text-ink" aria-label="Valid UPI ID" /> : null}
          />
        </Field>

        <div className="flex flex-wrap gap-2" aria-label="Common UPI handles">
          {HANDLES.map((h) => {
            const active = draft.upi.endsWith(h)
            return (
              <button
                key={h}
                type="button"
                onClick={() => applyHandle(h)}
                aria-pressed={active}
                className={cn(
                  'h-8 rounded-full border-2 border-ink px-3 text-xs font-bold transition-colors',
                  active ? 'bg-ink text-paper' : 'bg-paper hover:bg-sun-soft',
                )}
              >
                {h}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
