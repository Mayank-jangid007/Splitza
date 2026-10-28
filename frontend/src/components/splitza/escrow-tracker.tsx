import { Banknote, Check, KeyRound, Lock, Play, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS: { label: string; hint: string; icon: LucideIcon }[] = [
  { label: 'Funds Locked', hint: 'Your split goes into escrow', icon: Lock },
  { label: 'Credentials Shared', hint: 'Host sends your access', icon: KeyRound },
  { label: 'Plan Active', hint: 'Your seat goes live', icon: Play },
  { label: 'Payout Released', hint: 'Host gets paid', icon: Banknote },
]

export function EscrowTracker({ current }: { current: number }) {
  return (
    <section aria-label="Escrow progress" className="brut flex flex-col gap-5 rounded-[2rem] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight">Escrow progress</h2>
        <span className="rounded-full border-2 border-ink bg-sun px-2.5 py-0.5 font-mono text-xs font-bold">
          Step {Math.min(current + 1, STEPS.length)} of {STEPS.length}
        </span>
      </div>
      <ol className="grid grid-cols-4">
        {STEPS.map((step, index) => {
          const done = index < current
          const active = index === current
          const Icon = step.icon
          return (
            <li key={step.label} aria-current={active ? 'step' : undefined}
              className="relative flex flex-col items-center gap-2.5 px-1 text-center">
              {index < STEPS.length - 1 && (
                <span aria-hidden="true" className={cn('absolute top-[22px] left-1/2 h-1 w-full rounded-full',
                  index < current ? 'bg-ink' : 'bg-ink/15')} />
              )}
              <span className={cn('relative grid size-12 place-items-center rounded-full border-[2.5px] border-ink transition-colors',
                done && 'bg-mint', active && 'bg-sun shadow-brut-sm',
                !done && !active && 'border-dashed bg-cream text-ink/40')}>
                {active && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-sun/60" />}
                {done ? <Check className="relative size-5" strokeWidth={3} aria-hidden="true" />
                  : <Icon className="relative size-5" aria-hidden="true" />}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className={cn('text-xs leading-tight font-extrabold sm:text-sm', !done && !active && 'text-ink/50')}>
                  {step.label}
                </span>
                <span className="hidden text-xs leading-snug font-medium text-ink/60 md:block">{step.hint}</span>
                <span className="sr-only">{done ? 'Completed' : active ? 'In progress' : 'Upcoming'}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
