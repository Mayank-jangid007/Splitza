import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ESCROW_STEPS } from '@/lib/splitza'

type State = 'done' | 'current' | 'next'

function stateOf(index: number, stepsDone: number): State {
  if (index < stepsDone) return 'done'
  if (index === stepsDone) return 'current'
  return 'next'
}

export function EscrowBar({ stepsDone }: { stepsDone: number }) {
  const allDone = stepsDone >= 4
  const label = allDone ? 'All steps complete' : ESCROW_STEPS[stepsDone].title
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
        <span>Escrow</span>
        <span className="min-w-0 truncate pl-2 text-right">
          {allDone ? 'Step 4 of 4' : `Step ${stepsDone + 1} of 4`} · {label}
        </span>
      </div>
      <ol className="grid grid-cols-4 gap-1.5" aria-label="Escrow progress">
        {ESCROW_STEPS.map((step, i) => {
          const s = stateOf(i, stepsDone)
          return (
            <li
              key={step.title}
              aria-current={s === 'current' ? 'step' : undefined}
              className={cn(
                'relative grid h-8 place-items-center rounded-lg border-2 border-ink text-[11px] font-black',
                s === 'done' && 'bg-ink text-sun',
                s === 'current' && 'bg-sun shadow-neo-sm',
                s === 'next' && 'stripes-bg bg-paper text-ink/50',
              )}
            >
              <span className="sr-only">
                {step.title}: {s === 'done' ? 'done' : s === 'current' ? 'in progress' : 'up next'}
              </span>
              {s === 'done' ? <Check className="size-4" strokeWidth={4} /> : <span aria-hidden="true">{i + 1}</span>}
              {s === 'current' && (
                <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-ink bg-tang" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function EscrowTimeline({ stepsDone }: { stepsDone: number }) {
  return (
    <ol className="relative space-y-3" aria-label="Escrow progress">
      <div className="absolute bottom-6 left-[19px] top-6 w-0.5 border-l-2 border-dashed border-ink" aria-hidden="true" />
      {ESCROW_STEPS.map((step, i) => {
        const s = stateOf(i, stepsDone)
        return (
          <li
            key={step.title}
            aria-current={s === 'current' ? 'step' : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-2xl border-2 border-ink p-3',
              s === 'done' && 'bg-mint',
              s === 'current' && 'bg-sun shadow-neo-sm',
              s === 'next' && 'bg-paper',
            )}
          >
            <span
              className={cn(
                'z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-sm font-black',
                s === 'done' && 'bg-ink text-mint',
                s === 'current' && 'bg-paper',
                s === 'next' && 'bg-cream text-ink/50',
              )}
            >
              {s === 'done' ? <Check className="size-5" strokeWidth={4} /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{step.title}</p>
              <p className="text-xs text-ink/70">{step.hint}</p>
            </div>
            <span className="shrink-0 rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[10px] font-bold uppercase">
              {s === 'done' ? 'Done' : s === 'current' ? 'Now' : 'Next'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
