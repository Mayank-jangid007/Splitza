import { cn } from '@/lib/utils'

type ScallopBadgeProps = {
  children: React.ReactNode
  className?: string
  bumps?: number
  fillClassName?: string
}

function scallopPath(bumps: number) {
  const points: string[] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2
    const r = 44 + 5 * Math.cos(theta * bumps)
    const x = 50 + r * Math.cos(theta)
    const y = 50 + r * Math.sin(theta)
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `${points.join(' ')} Z`
}

export function ScallopBadge({
  children,
  className,
  bumps = 10,
  fillClassName = 'fill-lilac',
}: ScallopBadgeProps) {
  return (
    <div className={cn('relative grid place-items-center', className)}>
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible"
      >
        <path d={scallopPath(bumps)} transform="translate(3 3)" className="fill-ink" />
        <path
          d={scallopPath(bumps)}
          className={cn('stroke-ink', fillClassName)}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center text-center leading-none">
        {children}
      </div>
    </div>
  )
}
