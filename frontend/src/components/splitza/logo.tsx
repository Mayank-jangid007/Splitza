import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="brut-sm grid size-11 shrink-0 place-items-center rounded-full bg-sun text-xl font-extrabold">
        S
      </span>
      <span className="text-2xl font-extrabold tracking-tight">Splitza</span>
    </div>
  )
}
