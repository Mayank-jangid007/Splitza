'use client'

import Image from 'next/image'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { motion } from 'motion/react'
import type { Pool } from '@/lib/dashboard/types'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'
import { CreateButton } from './dashboard-nav'
import { PoolCard } from './pool-card'

const PREVIEW_COUNT = 2

interface PoolsSectionProps {
  pools: Pool[]
  hasAnyPools: boolean
  createHref: string
  onCreate?: () => void
  onSelectPool: (pool: Pool) => void
  onViewAll: () => void
}

export function PoolsSection({
  pools,
  hasAnyPools,
  createHref,
  onCreate,
  onSelectPool,
  onViewAll,
}: PoolsSectionProps) {
  if (!hasAnyPools) {
    return (
      <div className="rounded-3xl border-2 border-foreground bg-white shadow-brutal">
        <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_260px]">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-balance">
              No shared pools yet
            </h2>
            <p className="mt-3 max-w-md text-pretty font-medium leading-relaxed text-foreground/75">
              Host a subscription to split it with others, or browse the
              marketplace to join an existing pool.
            </p>
            <CreateButton href={createHref} onClick={onCreate} className="mt-6 h-12 px-5 text-sm">
              Create a split plan
            </CreateButton>
          </div>
          <div className="relative order-1 aspect-square w-full max-w-[260px] justify-self-center overflow-hidden rounded-2xl border-2 border-foreground bg-lilac shadow-brutal-sm md:order-2">
            <Image
              src="/illustrations/neo-empty.png"
              alt="Empty seats around a vault, waiting for a pool"
              fill
              sizes="260px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    )
  }

  if (pools.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-3xl border-2 border-foreground bg-white px-6 py-14 text-center shadow-brutal"
      >
        <span className="flex size-14 items-center justify-center rounded-full border-2 border-foreground bg-blush">
          <SearchX className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
          No pools match your search
        </h2>
        <p className="mt-2 max-w-sm text-pretty text-sm font-medium text-foreground/75">
          Try a different name or host, or change the filter.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-5">
        {pools.slice(0, PREVIEW_COUNT).map((pool, index) => (
          <li key={pool.id}>
            <PoolCard pool={pool} onSelect={onSelectPool} index={index} />
          </li>
        ))}
      </ul>

      <motion.button
        type="button"
        onClick={onViewAll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className={cn(
          'flex w-full items-center justify-between gap-4 rounded-3xl border-2 border-foreground bg-white px-5 py-4 text-left',
          neoLift,
          neoFocus,
        )}
      >
        <span>
          <span className="block text-xs font-semibold text-foreground/70">
            View all pools
          </span>
          <span className="mt-0.5 block text-base font-extrabold tracking-tight">
            Browse all {pools.length} shared plans
          </span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-sun">
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </span>
      </motion.button>
    </div>
  )
}
