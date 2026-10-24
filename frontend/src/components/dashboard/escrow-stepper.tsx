import { Check } from 'lucide-react'
import type { EscrowStep } from '@/lib/dashboard/types'
import { cn } from '@/lib/utils'

const steps = ['Funds locked', 'Credentials shared', 'Plan active', 'Payout released']

export function EscrowStepper({ current }: { current: EscrowStep }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Escrow progress">
      {steps.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className="min-w-0"
          >
            <span
              className={cn(
                'flex h-10 items-center justify-center rounded-xl border-2 font-mono text-sm font-bold',
                done && 'border-foreground bg-mint',
                active && 'border-foreground bg-sun shadow-brutal-sm',
                !done && !active && 'border-foreground/30 bg-white text-foreground/50',
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : step}
            </span>
            <span
              className={cn(
                'mt-2 block text-xs leading-tight',
                active ? 'font-extrabold' : 'font-semibold text-foreground/70',
              )}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
