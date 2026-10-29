import { cn } from '@/lib/utils'
import type { EscrowPool } from './types'

interface PoolHeaderProps {
  pool: EscrowPool
  title: string
  sub: string
  badgeBg?: string
}

export function PoolHeader({ pool, title, sub, badgeBg = 'bg-[#8de89a]' }: PoolHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#151515] text-xl font-extrabold shadow-[2px_2px_0_0_#151515]', badgeBg)}>
        {pool.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pool.logoUrl} alt="" className="size-8 object-contain" />
        ) : (
          pool.name.charAt(0)
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-xl font-extrabold leading-tight tracking-tight">{title}</h2>
        <p className="text-sm font-semibold text-[#3d3a32]">{sub}</p>
      </div>
    </div>
  )
}
