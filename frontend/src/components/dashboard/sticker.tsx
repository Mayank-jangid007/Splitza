import { cn } from '@/lib/utils'

type StickerTone = 'lilac' | 'sun' | 'mint' | 'blush' | 'peach'

const fills: Record<StickerTone, string> = {
  lilac: 'fill-lilac',
  sun: 'fill-sun',
  mint: 'fill-mint',
  blush: 'fill-blush',
  peach: 'fill-peach',
}

const pathCache = new Map<number, string>()

function scallopPath(bumps: number) {
  const cached = pathCache.get(bumps)
  if (cached) return cached
  const steps = 180
  const points: string[] = []
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const radius = 39 + 6 * Math.abs(Math.cos((bumps * angle) / 2))
    points.push(
      `${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`,
    )
  }
  const path = `M${points.join('L')}Z`
  pathCache.set(bumps, path)
  return path
}

export function Sticker({
  bumps = 12,
  tone = 'lilac',
  className,
  children,
}: {
  bumps?: number
  tone?: StickerTone
  className?: string
  children: React.ReactNode
}) {
  const d = scallopPath(bumps)
  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
    >
      <svg
        viewBox="-50 -50 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
      >
        <path d={d} transform="translate(3 3)" className="fill-foreground" />
        <path
          d={d}
          className={cn('stroke-foreground', fills[tone])}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
      </svg>
      <span className="relative text-center">{children}</span>
    </span>
  )
}
