import { cn } from '@/lib/utils'

type TagTone = 'ink' | 'white' | 'sun' | 'blush' | 'mint'

const tones: Record<TagTone, string> = {
  ink: 'bg-foreground text-background',
  white: 'bg-white text-foreground',
  sun: 'bg-sun text-foreground',
  blush: 'bg-blush text-foreground',
  mint: 'bg-mint text-foreground',
}

export function Tag({
  tone = 'white',
  className,
  children,
}: {
  tone?: TagTone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold leading-tight',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function MonoLabel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        'font-mono text-[11px] font-bold uppercase tracking-wider text-foreground/70',
        className,
      )}
    >
      {children}
    </p>
  )
}
