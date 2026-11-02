'use client'

import { ArrowLeft, ArrowRight, Loader2, Rocket } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DASHBOARD_HREF,
  INITIAL_DRAFT,
  buildPayload,
  formatINR,
  isStepValid,
  round2,
  summarize,
  type CreatePoolPayload,
  type CreatePoolResult,
  type PoolDraft,
} from '@/lib/pool'
import { Button, buttonClass } from './neo'
import { PoolCard } from './pool-card'
import { Progress, STEPS } from './progress'
import { StepCredentials } from './step-credentials'
import { StepPayout } from './step-payout'
import { StepReview } from './step-review'
import { StepSelect } from './step-select'
import { StepSetup } from './step-setup'
import { StepVisibility } from './step-visibility'
import { Success } from './success'

const LAST_STEP = STEPS.length - 1

export function Wizard({
  onBack,
  onLaunch,
}: {
  onBack?: () => void
  onLaunch?: (payload: CreatePoolPayload) => CreatePoolResult | void | Promise<CreatePoolResult | void>
}) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<PoolDraft>(INITIAL_DRAFT)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreatePoolResult | null>(null)
  const isFirstRender = useRef(true)

  const update = useCallback((patch: Partial<PoolDraft>) => {
    setDraft((d) => ({ ...d, ...patch }))
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.getElementById('step-heading')?.focus({ preventScroll: true })
  }, [step, result])

  const summary = summarize(draft)
  const valid = isStepValid(step, draft)

  function goNext() {
    setError(null)
    setStep((s) => Math.min(LAST_STEP, s + 1))
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  function goHome() {
    if (onBack) onBack()
    else window.location.assign(DASHBOARD_HREF)
  }

  function localResult(payload: CreatePoolPayload): CreatePoolResult {
    const totalSeats = payload.memberLimit + 1
    const totalCost =
      payload.billingCycle === 'days'
        ? (payload.monthlyPrice / 30) * payload.planDays
        : payload.monthlyPrice * payload.planMonths
    return {
      poolId: crypto.randomUUID(),
      status: 'OPEN',
      totalSeats,
      openSeats: totalSeats - 1,
      totalCost: round2(totalCost),
      pricePerSeat: round2(totalCost / totalSeats),
      inviteUrl:
        payload.visibility === 'private'
          ? `${window.location.origin}/join/${crypto.randomUUID().replace(/-/g, '')}`
          : null,
    }
  }

  async function launch() {
    const payload = buildPayload(draft)
    if (!payload || launching) return
    setLaunching(true)
    setError(null)
    try {
      const res = await onLaunch?.(payload)
      setResult(res ?? localResult(payload))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLaunching(false)
    }
  }

  function reset() {
    setDraft(INITIAL_DRAFT)
    setResult(null)
    setError(null)
    setStep(0)
  }

  const showPrice = !!summary && summary.monthlyPrice > 0

  return (
    <div className="share-plan-scope grid-paper flex min-h-dvh flex-col bg-cream text-ink">
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-6 sm:px-8 sm:pt-8">
        {result && summary ? (
          <Success result={result} summary={summary} visibility={draft.visibility} onReset={reset} onBack={goHome} />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <button
                  type="button"
                  onClick={goHome}
                  aria-label="Close and return to my pools"
                  className="group inline-flex h-9 w-fit items-center gap-2 rounded-full border-2 border-ink bg-paper pl-2.5 pr-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:-translate-x-px hover:-translate-y-px hover:hard-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <ArrowLeft
                    className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                  My pools
                </button>
                <Progress current={step} />
              </div>
              <div key={step} className="animate-rise">
                {step === 0 && (
                  <StepSelect
                    draft={draft}
                    onPickOfficial={(id) => update({ mode: 'official', officialId: id })}
                    onPickCustom={() => update({ mode: 'custom', officialId: null })}
                    onModeOfficial={() => update({ mode: 'official', officialId: null })}
                  />
                )}
                {step === 1 && <StepSetup draft={draft} update={update} />}
                {step === 2 && <StepVisibility draft={draft} update={update} />}
                {step === 3 && <StepCredentials draft={draft} update={update} />}
                {step === 4 && <StepPayout draft={draft} update={update} />}
                {step === 5 && <StepReview draft={draft} error={error} onEdit={setStep} />}
              </div>
            </div>

            <aside aria-label="Pool preview" className="hidden flex-col gap-5 lg:sticky lg:top-8 lg:flex lg:self-start">
              <PoolCard summary={summary} visibility={draft.visibility} />
            </aside>
          </div>
        )}
      </main>

      {!result && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-ink bg-paper">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
            {step === 0 ? (
              <button type="button" onClick={goHome} className={buttonClass('ghost', 'md')}>
                Cancel
              </button>
            ) : (
              <Button tone="paper" onClick={goBack} disabled={launching}>
                <ArrowLeft className="size-4" strokeWidth={2.5} />
                Back
              </Button>
            )}

            <div className="hidden min-w-0 flex-1 flex-col items-center sm:flex" aria-live="polite">
              {summary ? (
                <>
                  <span className="max-w-full truncate font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-stone">
                    {summary.name || 'Custom split'} · {summary.totalSeats} seats
                  </span>
                  <span className="font-display text-base font-black leading-tight">
                    {showPrice ? formatINR(summary.perSeat) : '₹—'}
                    <span className="font-mono text-xs font-medium text-stone"> / seat</span>
                  </span>
                </>
              ) : (
                <span className="text-xs text-stone">Choose a plan to continue</span>
              )}
            </div>

            {step === LAST_STEP ? (
              <Button tone="ink" size="md" onClick={launch} disabled={launching}>
                {launching ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                {launching ? 'Launching…' : error ? 'Try again' : 'Launch pool'}
              </Button>
            ) : (
              <Button tone="sun" size="md" onClick={goNext} disabled={!valid}>
                Continue
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
