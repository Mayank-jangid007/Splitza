'use client'

import { Lock } from 'lucide-react'
import { useState } from 'react'
import {
  LIMITS,
  formatINR,
  getOfficialPlan,
  summarize,
  validateCustomName,
  validateCustomPrice,
  type BillingCycle,
  type PoolDraft,
} from '@/lib/pool'
import { BrandMark, Card, Counter, Eyebrow, Field, SeatDots, Segmented, TextInput } from './neo'
import { StepHeader } from './step-header'

type Props = { draft: PoolDraft; update: (patch: Partial<PoolDraft>) => void }

export function StepSetup({ draft, update }: Props) {
  return draft.mode === 'official' ? <OfficialSetup draft={draft} /> : <CustomSetup draft={draft} update={update} />
}

function OfficialSetup({ draft }: { draft: PoolDraft }) {
  const plan = getOfficialPlan(draft)
  const s = summarize(draft)
  if (!plan || !s) return null

  const rows = [
    ['Monthly price', formatINR(plan.price)],
    ['Duration', s.durationLabel],
    ['Member limit', `${plan.memberLimit} + you`],
    ['Total seats', String(s.totalSeats)],
  ]

  return (
    <section className="flex flex-col gap-8" aria-labelledby="step-heading">
      <StepHeader
        kicker="Setup"
        title="Locked & loaded."
        description="Official plans use the provider's real pricing and limits, so every member pays a fair share."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 border-b-2 border-ink bg-sun-soft p-5">
          <BrandMark src={plan.logo} alt="" tint={plan.tint} className="bg-paper" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-black leading-tight">{plan.name}</p>
            <p className="text-xs text-stone">{plan.tier} tier</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
            <Lock className="size-3" aria-hidden="true" />
            Fixed
          </span>
        </div>
        <dl className="divide-y-2 divide-dashed divide-ink/15 px-5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-3.5">
              <dt className="text-sm text-stone">{k}</dt>
              <dd className="text-sm font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="m-3 flex items-center justify-between rounded-2xl border-2 border-ink bg-lilac p-4">
          <div className="flex flex-col gap-2">
            <Eyebrow>Each seat pays</Eyebrow>
            <SeatDots total={s.totalSeats} />
          </div>
          <p className="font-display text-3xl font-black">{formatINR(s.perSeat)}</p>
        </div>
      </Card>
    </section>
  )
}

function CustomSetup({ draft, update }: Props) {
  const [touched, setTouched] = useState({ name: false, price: false })
  const nameError = touched.name ? validateCustomName(draft.customName) : null
  const priceError = touched.price ? validateCustomPrice(draft.customPrice) : null
  const s = summarize(draft)

  return (
    <section className="flex flex-col gap-8" aria-labelledby="step-heading">
      <StepHeader
        kicker="Setup"
        title="Build your split."
        description="Set the monthly price and how long the pool runs. Per-seat cost includes you as the host."
      />

      <div className="flex flex-col gap-6">
        <Field label="Subscription name" htmlFor="custom-name" error={nameError}>
          <TextInput
            id="custom-name"
            value={draft.customName}
            onChange={(e) => update({ customName: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="e.g. Notion Plus, ChatGPT Team"
            maxLength={60}
            autoComplete="off"
            invalid={!!nameError}
          />
        </Field>

        <Field label="Monthly price" htmlFor="custom-price" error={priceError} hint="What the provider charges per month.">
          <TextInput
            id="custom-price"
            prefix="₹"
            inputMode="decimal"
            value={draft.customPrice}
            onChange={(e) => update({ customPrice: e.target.value.replace(/[^\d.]/g, '') })}
            onBlur={() => setTouched((t) => ({ ...t, price: true }))}
            placeholder="0"
            invalid={!!priceError}
            suffix={<span className="text-xs font-bold text-stone">/ month</span>}
          />
        </Field>

        <Field label="Billing cycle">
          <Segmented<BillingCycle>
            label="Billing cycle"
            value={draft.billingCycle}
            onChange={(v) => update({ billingCycle: v })}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
              { value: 'days', label: 'Days' },
            ]}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          {draft.billingCycle === 'monthly' && (
            <Field label="Duration" hint={`${LIMITS.minMonths}–${LIMITS.maxMonths} months`}>
              <Counter
                label="Duration in months"
                value={draft.months}
                min={LIMITS.minMonths}
                max={LIMITS.maxMonths}
                unit={draft.months === 1 ? 'month' : 'months'}
                onChange={(v) => update({ months: v })}
              />
            </Field>
          )}
          {draft.billingCycle === 'yearly' && (
            <Field label="Duration" hint="Yearly pools always run 12 months.">
              <div className="flex h-13 items-center justify-between rounded-2xl border-2 border-dashed border-ink px-4">
                <span className="font-display text-xl font-black">12</span>
                <span className="text-xs font-bold text-stone">months · fixed</span>
              </div>
            </Field>
          )}
          {draft.billingCycle === 'days' && (
            <Field label="Duration" hint={`${LIMITS.minDays}–${LIMITS.maxDays} days`}>
              <Counter
                label="Duration in days"
                value={draft.days}
                min={LIMITS.minDays}
                max={LIMITS.maxDays}
                unit={draft.days === 1 ? 'day' : 'days'}
                onChange={(v) => update({ days: v })}
              />
            </Field>
          )}

          <Field label="Members" hint="Not counting you.">
            <Counter
              label="Member limit"
              value={draft.memberLimit}
              min={LIMITS.minMembers}
              max={LIMITS.maxMembers}
              unit={draft.memberLimit === 1 ? 'member' : 'members'}
              onChange={(v) => update({ memberLimit: v })}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border-2 border-ink bg-lilac p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Eyebrow>{s ? `${s.totalSeats} seats · ${formatINR(s.totalCost)} total` : 'Seats'}</Eyebrow>
            {s && <SeatDots total={s.totalSeats} />}
          </div>
          <div className="sm:text-right">
            <p className="font-display text-3xl font-black leading-none">
              {s && s.monthlyPrice > 0 ? formatINR(s.perSeat) : '₹—'}
            </p>
            <p className="mt-1 text-xs text-ink/70">per seat / {s?.durationLabel}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
