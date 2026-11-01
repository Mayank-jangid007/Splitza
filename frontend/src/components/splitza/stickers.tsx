import { cn } from '@/lib/utils'

type StickerProps = {
  className?: string
  fill?: string
  stroke?: string
}

export function Flower({
  className,
  fill = '#f5aee3',
  stroke = '#151515',
  petals = 12,
  face = false,
}: StickerProps & { petals?: number; face?: boolean }) {
  const cx = 100
  const cy = 100
  const orbit = 56
  const r = 24
  const items = Array.from({ length: petals }, (_, i) => {
    const a = (i / petals) * Math.PI * 2
    return { x: cx + Math.cos(a) * orbit, y: cy + Math.sin(a) * orbit }
  })
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={cn('block', className)}>
      <g fill={stroke} stroke={stroke} strokeWidth="9" strokeLinejoin="round">
        {items.map((p, i) => (
          <circle key={`s${i}`} cx={p.x} cy={p.y} r={r} />
        ))}
        <circle cx={cx} cy={cy} r={orbit} />
      </g>
      <g fill={fill}>
        {items.map((p, i) => (
          <circle key={`f${i}`} cx={p.x} cy={p.y} r={r} />
        ))}
        <circle cx={cx} cy={cy} r={orbit} />
      </g>
      {face && (
        <g stroke={stroke} strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M76 80 v16 M124 80 v16" />
          <path d="M72 116 q28 28 56 0" />
        </g>
      )}
    </svg>
  )
}

export function Sparkle({ className, fill = '#f8d56b', stroke = '#151515' }: StickerProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn('block', className)}>
      <path
        d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Burst({ className, fill = '#f8d56b', stroke = '#151515' }: StickerProps) {
  const points = 14
  const d = Array.from({ length: points * 2 }, (_, i) => {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const rad = i % 2 === 0 ? 48 : 31
    return `${i === 0 ? 'M' : 'L'}${(50 + Math.cos(a) * rad).toFixed(2)} ${(50 + Math.sin(a) * rad).toFixed(2)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn('block', className)}>
      <path d={`${d}Z`} fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}

export function Squiggle({ className, stroke = '#151515' }: StickerProps) {
  return (
    <svg viewBox="0 0 160 24" aria-hidden="true" className={cn('block', className)}>
      <path
        d="M4 12 q10 -14 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
        fill="none"
        stroke={stroke}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Plus({ className, stroke = '#151515' }: StickerProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('block', className)}>
      <path d="M12 3v18M3 12h18" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn('block', className)}>
      <rect x="3" y="3" width="42" height="42" rx="12" fill="#151515" />
      <path d="M24 6 a18 18 0 0 1 0 36 Z" fill="#f8d56b" />
      <path d="M24 6 a18 18 0 0 0 0 36 Z" fill="#b3a6f7" />
      <path d="M24 6 V42" stroke="#151515" strokeWidth="3" />
      <circle cx="24" cy="24" r="5" fill="#fffdf8" stroke="#151515" strokeWidth="3" />
    </svg>
  )
}
