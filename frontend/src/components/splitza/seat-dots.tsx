import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

type SeatDotsProps = {
  total: number
  filled: number
  size?: 'sm' | 'md'
}

export function SeatDots({ total, filled, size = 'md' }: SeatDotsProps) {
  const dimension = size === 'md' ? 'size-9' : 'size-7'
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`${filled} of ${total} seats filled`}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isFilled = index < filled
        return (
          <span
            key={index}
            className={cn(
              'grid shrink-0 place-items-center rounded-full',
              dimension,
              isFilled
                ? 'border-2 border-ink bg-ink text-cream'
                : 'border-2 border-dashed border-ink/70 bg-cream/70',
            )}
          >
            {isFilled && <User className="size-4" aria-hidden="true" />}
          </span>
        )
      })}
    </div>
  )
}
