import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { Pool } from '@/lib/dashboard/types'
import {
  formatINR,
  getOpenSeats,
  getPoolCapital,
} from '@/lib/dashboard/pool-utils'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'
import { Sticker } from './sticker'

interface OverviewCardProps {
  pools: Pool[]
  shareHref: string
  joinHref: string
  onShare?: () => void
  onJoin?: () => void
}

export function OverviewCard({ pools, shareHref, joinHref, onShare, onJoin }: OverviewCardProps) {
  const totalCapital = pools.reduce((sum, pool) => sum + getPoolCapital(pool), 0)
  const openSeats = pools
    .filter((pool) => pool.role === 'host')
    .reduce((sum, pool) => sum + getOpenSeats(pool), 0)

  return (
    <section
      aria-label="Overview"
      className="rounded-3xl border-2 border-foreground bg-white p-5 shadow-brutal sm:p-6"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground/70">
            Total pool capital
          </p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-tight sm:text-4xl">
            {formatINR(totalCapital)}
          </p>
          <p className="mt-2 text-sm font-medium text-foreground/70 sm:hidden">
            {pools.length} pools · {openSeats} open seats
          </p>
        </div>

        <div className="hidden shrink-0 items-center pr-2 sm:flex" aria-label={`${pools.length} pools, ${openSeats} open seats`}>
          <Sticker tone="lilac" bumps={12} className="size-28 -rotate-6">
            <span className="block text-3xl font-extrabold leading-none">
              {pools.length}
            </span>
            <span className="block text-xs font-bold">pools</span>
          </Sticker>
          <Sticker tone="mint" bumps={10} className="-ml-4 mt-6 size-24 rotate-6">
            <span className="block text-2xl font-extrabold leading-none">
              {openSeats}
            </span>
            <span className="block text-xs font-bold">open seats</span>
          </Sticker>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ActionLink
          href={shareHref}
          onClick={onShare}
          label="Share a plan"
          icon={<ArrowUpRight className="size-4" aria-hidden="true" />}
          className="bg-sun"
        />
        <ActionLink
          href={joinHref}
          onClick={onJoin}
          label="Join a plan"
          icon={<ArrowDownLeft className="size-4" aria-hidden="true" />}
          className="bg-blush"
        />
      </div>
    </section>
  )
}

function ActionLink({
  href,
  onClick,
  label,
  icon,
  className,
}: {
  href: string
  onClick?: () => void
  label: string
  icon: React.ReactNode
  className?: string
}) {
  const inner = (
    <>
      <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
        {icon}
      </span>
      {label}
    </>
  )
  const cls = cn(
    'flex items-center gap-3 rounded-2xl border-2 border-foreground px-3 py-2.5 font-bold',
    neoLift,
    neoFocus,
    className,
  )
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    )
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  )
}
