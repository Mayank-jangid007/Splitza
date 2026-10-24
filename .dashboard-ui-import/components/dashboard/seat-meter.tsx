import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SeatMeter({
  capacity,
  filled,
}: {
  capacity: number
  filled: number
}) {
  const open = Math.max(capacity - filled, 0)
  return (
    <span className="block">
      <span
        role="img"
        aria-label={`${filled} of ${capacity} seats filled, ${open} open`}
        className="flex flex-wrap items-center gap-1.5"
      >
        {Array.from({ length: capacity }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              'flex size-8 items-center justify-center rounded-full border-2 border-foreground',
              i < filled
                ? 'bg-foreground text-background'
                : 'border-dashed bg-white/70',
            )}
          >
            {i < filled && <User className="size-4" />}
          </span>
        ))}
      </span>
      <span className="mt-2.5 block text-sm font-bold">
        {filled}/{capacity} seats filled
        <span className="font-medium text-foreground/70"> · {open} open</span>
      </span>
    </span>
  )
}
