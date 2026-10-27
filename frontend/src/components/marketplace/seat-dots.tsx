import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SeatDots({
  total,
  filled,
  size = 'md',
}: {
  total: number
  filled: number
  size?: 'sm' | 'md'
}) {
  const dim = size === 'md' ? 'size-9' : 'size-7'
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-foreground',
            dim,
            i < filled ? 'bg-foreground text-background' : 'border-dashed bg-white/70',
          )}
        >
          {i < filled && <User className="size-4" />}
        </span>
      ))}
    </div>
  )
}
