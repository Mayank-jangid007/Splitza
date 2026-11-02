import { cn } from '@/lib/utils'

export const STEPS = ['Plan', 'Setup', 'Visibility', 'Access', 'Payout', 'Review'] as const

export function Progress({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="flex flex-col gap-3">
      <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
        <span>
          Step {String(current + 1).padStart(2, '0')}
          <span className="text-stone"> / {String(STEPS.length).padStart(2, '0')}</span>
        </span>
        <span className="text-stone">{STEPS[current]}</span>
      </div>
      <ol className="grid grid-cols-6 gap-1.5">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === current ? 'step' : undefined}>
            <span className="sr-only">
              {label}
              {i < current ? ' (done)' : i === current ? ' (current)' : ''}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'block h-2.5 rounded-full border-2 border-ink transition-colors',
                i < current && 'bg-ink',
                i === current && 'stripe-bg bg-sun',
                i > current && 'bg-paper',
              )}
            />
          </li>
        ))}
      </ol>
    </nav>
  )
}
