import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Secure payment', 'Access granted', 'Escrow active']

export function Progress({ stage }: { stage: 0 | 1 | 2 }) {
  return (
    <nav aria-label="Payment progress">
      <ol className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done = i < stage
          const active = i === stage
          return (
            <li key={label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className={cn('h-0.5 flex-1 transition-colors', done ? 'bg-[#151515]' : 'bg-[#151515]/20')} />
                )}
                <span className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border-2 border-[#151515] font-mono text-xs font-bold transition-colors',
                  done && 'bg-[#8de89a]',
                  active && 'bg-[#f7c85a] shadow-[2px_2px_0_0_#151515]',
                  !done && !active && 'bg-white text-[#151515]/40',
                )}>
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-0.5 flex-1 transition-colors', done ? 'bg-[#151515]' : 'bg-[#151515]/20')} />
                )}
              </div>
              <span className={cn('text-center text-xs font-bold leading-tight',
                active ? 'text-[#151515]' : done ? 'text-[#151515]/70' : 'text-[#151515]/40')}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
