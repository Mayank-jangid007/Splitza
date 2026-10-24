import Link from 'next/link'
import { neoFocus } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

export function Brand({
  href,
  className,
}: {
  href: string
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-label="Splitza home"
      className={cn('inline-flex items-center gap-2.5 rounded-xl', neoFocus, className)}
    >
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-xl border-2 border-foreground bg-sun text-lg font-extrabold shadow-brutal-sm"
      >
        S
      </span>
      <span className="text-xl font-extrabold tracking-tight">Splitza</span>
    </Link>
  )
}
