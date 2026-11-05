'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck, Clapperboard, Cloud, Gamepad2, GraduationCap,
  LayoutGrid, Music, Search, Shapes, ShieldCheck, Star, type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  CATEGORIES,
  planDurationLabel,
  rupee,
  type Category,
  type MarketPool,
} from '@/lib/splitza'
import type { MarketplacePool } from '@/components/marketplace-view'
import { poolsApi, type MarketplacePoolItem } from '@/lib/api'
import { SeatDots } from './home-pool-card'
import { useReveal } from '@/components/reveal'
import { Burst, Flower, Sparkle } from './stickers'
import { Chip, NeoButton, PlatformLogo, inputClass } from './ui'
import { JoinFlow } from './pool-detail-dialog'

interface MarketplaceProps {
  onCreatePlan?: () => void
  onJoin?: (pool: MarketplacePool) => void
  onDone?: () => void
}

type Filter = 'All' | Category

const FILTER_STYLES: Record<Filter, { icon: LucideIcon; bg: string }> = {
  All: { icon: LayoutGrid, bg: 'bg-mint' },
  Entertainment: { icon: Clapperboard, bg: 'bg-bubble' },
  Music: { icon: Music, bg: 'bg-lilac' },
  Cloud: { icon: Cloud, bg: 'bg-sky' },
  Education: { icon: GraduationCap, bg: 'bg-sun' },
  Games: { icon: Gamepad2, bg: 'bg-mint' },
  Others: { icon: Shapes, bg: 'bg-peach' },
}

function guessCategory(name: string): Category {
  const n = name.toLowerCase()
  if (['netflix', 'disney', 'hotstar', 'prime', 'youtube', 'zee', 'sony'].some((k) => n.includes(k))) return 'Entertainment'
  if (['spotify', 'apple music', 'jiosaavn', 'gaana', 'wynk'].some((k) => n.includes(k))) return 'Music'
  if (['google one', 'icloud', 'dropbox', 'onedrive', 'microsoft', 'box'].some((k) => n.includes(k))) return 'Cloud'
  if (['duolingo', 'coursera', 'skillshare', 'udemy', 'linkedin learning'].some((k) => n.includes(k))) return 'Education'
  if (['xbox', 'playstation', 'ps plus', 'ea play', 'nintendo', 'steam'].some((k) => n.includes(k))) return 'Games'
  return 'Others'
}

function apiItemToMarket(item: MarketplacePoolItem): MarketPool {
  const total = item.maxSeats
  const filled = item.filledSeats ?? Math.max(total - item.openSeats, 0)
  return {
    id: item.id,
    name: item.platformName,
    host: item.hostName,
    trust: item.hostTrustScore ?? 4.5,
    pricePerSeat: item.pricePerSeat,
    durationMonths: item.planMonths ?? 1,
    durationDays: item.planDays && item.planDays > 0 ? item.planDays : undefined,
    seats: total,
    filled,
    category: guessCategory(item.platformName),
  }
}

function toJoinable(pool: MarketPool): MarketplacePool {
  const days = pool.durationDays ?? pool.durationMonths * 30
  return {
    id: pool.id,
    service: pool.name,
    category: pool.category,
    term: days / 30,
    price: pool.pricePerSeat,
    available: Math.max(pool.seats - pool.filled, 0),
    total: pool.seats,
    accent: 'green',
    kind: 'PRE_STORED',
    remainingDays: days,
    hostName: pool.host,
    logoUrl: null,
  }
}

export function Marketplace({ onCreatePlan, onJoin, onDone }: MarketplaceProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [selected, setSelected] = useState<MarketPool | null>(null)
  const [livePools, setLivePools] = useState<MarketPool[]>([])
  const [liveLoading, setLiveLoading] = useState(true)
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const topRevealRef = useReveal<HTMLDivElement>()
  const listRevealRef = useReveal<HTMLDivElement>([liveLoading, filter])

  useEffect(() => {
    let cancelled = false
    poolsApi
      .getMyPools()
      .then((res) => {
        if (!cancelled && res.ok) setJoinedIds(new Set(res.data.map((p) => p.id)))
      })
      .catch(() => {
        // Non-fatal — join buttons stay available.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLiveLoading(true)
    poolsApi
      .getMarketplace({ hasOpenSeats: false })
      .then((res) => {
        if (cancelled) return
        if (res.ok && Array.isArray(res.data)) setLivePools(res.data.map(apiItemToMarket))
      })
      .catch(() => {
        // Non-fatal — empty state is shown.
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pools = useMemo(() => {
    // Only show real pools from the backend. Demo/seed data is NOT
    // merged in because those pools can't actually be joined.
    return livePools
  }, [livePools])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pools.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.host.toLowerCase().includes(q)
      return matchesQuery && (filter === 'All' || p.category === filter)
    })
  }, [pools, query, filter])

  const countFor = (category: Filter) => {
    const q = query.trim().toLowerCase()
    return pools.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.host.toLowerCase().includes(q)
      return matchesQuery && (category === 'All' || p.category === category)
    }).length
  }

  const openSeatsTotal = pools.reduce((n, p) => n + Math.max(p.seats - p.filled, 0), 0)

  return (
    <div className="space-y-10">
      <div ref={topRevealRef} className="space-y-10">
      <section
        aria-labelledby="market-title"
        data-reveal
        className="relative overflow-hidden rounded-[32px] border-2 border-ink bg-sky p-6 shadow-neo-lg sm:p-10"
      >
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <Flower className="animate-spin-slow absolute -right-10 -top-10 size-44 sm:size-60" fill="#f8d56b" petals={10} face />
        <Burst className="animate-float absolute bottom-6 right-24 hidden size-20 sm:block" fill="#f5aee3" />
        <Sparkle className="animate-float absolute bottom-10 right-8 size-10" fill="#fffdf8" />
        <div className="relative max-w-2xl">
          <Chip tone="paper" className="mb-4">
            <BadgeCheck className="size-3.5" strokeWidth={3} /> Marketplace Hub
          </Chip>
          <h1 id="market-title" className="font-display-tight text-4xl font-black sm:text-6xl">
            Find an open seat.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
            {openSeatsTotal} seats are open across public pools right now. Pick one, pay by UPI, and your money
            stays locked in escrow until the plan is live.
          </p>
        </div>
      </section>

      <section aria-label="Search and filter pools" data-reveal className="space-y-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
            strokeWidth={3}
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pool or platform name"
            aria-label="Search pools"
            className={cn(inputClass, 'h-14 pl-12 text-base')}
          />
        </div>

        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-1 flex gap-3 overflow-x-auto px-1 pt-1.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((item) => {
            const active = filter === item
            const style = FILTER_STYLES[item]
            const Icon = style.icon
            const count = countFor(item)
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item)}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-full border-[2.5px] border-ink py-1.5 pr-3 pl-1.5 font-bold transition-all duration-150',
                  active
                    ? cn(style.bg, 'translate-x-[2px] translate-y-[2px] shadow-[0_0_0_0_var(--ink)]')
                    : 'bg-white shadow-brut-sm hover:-translate-y-0.5 hover:shadow-brut',
                  count === 0 && !active && 'opacity-60',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-full border-2 border-ink transition-colors',
                    active ? 'bg-white' : style.bg,
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {item}
                <span
                  className={cn(
                    'grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 font-mono text-xs',
                    active ? 'bg-ink text-cream' : 'bg-ink/10 text-ink',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </section>
      </div>

      <section ref={listRevealRef} aria-live="polite" aria-label="Marketplace pools">
        {liveLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading marketplace">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl border-2 border-ink/40 bg-paper/70" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="grid items-center gap-6 rounded-[32px] border-2 border-dashed border-ink bg-paper p-6 sm:grid-cols-[200px_1fr] sm:p-8">
            <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-3xl border-2 border-ink shadow-neo">
              <Image
                src="/illustrations/empty-seat.png"
                alt="A smiling daisy on an empty seat"
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display-tight text-3xl font-black">No pools found</h3>
              <p className="mt-3 text-sm text-ink/75">
                Nothing matches {query ? `“${query}”` : filter === 'All' ? 'your search' : `${filter} pools`}. Try another search, or start the pool
                yourself.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                <NeoButton
                  tone="paper"
                  onClick={() => {
                    setQuery('')
                    setFilter('All')
                  }}
                >
                  Clear filters
                </NeoButton>
                <NeoButton tone="sun" onClick={onCreatePlan}>
                  Share a subscription
                </NeoButton>
              </div>
            </div>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((pool) => {
              const open = Math.max(pool.seats - pool.filled, 0)
              const full = open <= 0
              const joined = joinedIds.has(pool.id)
              return (
                <li
                  key={pool.id}
                  data-reveal
                  className="neo-press group relative flex flex-col gap-4 rounded-3xl border-2 border-ink bg-paper p-5 shadow-neo"
                >
                  <div className="flex items-start gap-3">
                    <PlatformLogo name={pool.name} size={52} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display-tight text-lg font-black leading-tight">
                        <button
                          type="button"
                          onClick={() => setSelected(pool)}
                          className="text-left outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:ring-4 focus-visible:after:ring-ink/40"
                        >
                          {pool.name}
                        </button>
                      </h3>
                      <p className="mt-1 truncate text-xs text-ink/70">Host · {pool.host}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone="paper">
                      <Star className="size-3 fill-sun" strokeWidth={2.5} />
                      {pool.trust.toFixed(1)} trust
                    </Chip>
                    <Chip tone="sky">{open} open</Chip>
                  </div>

                  <div className="flex items-end justify-between rounded-2xl border-2 border-ink bg-cream p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Per seat</p>
                      <p className="font-display-tight text-2xl font-black">{rupee(pool.pricePerSeat)}</p>
                      <p className="text-[11px]">/ {planDurationLabel(pool)}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-2 text-xs font-bold">
                        {pool.filled} filled · {open} open
                      </p>
                      <SeatDots filled={pool.filled} seats={pool.seats} />
                    </div>
                  </div>

                  <NeoButton
                    tone={joined ? 'mint' : full ? 'paper' : 'sun'}
                    disabled={joined || full}
                    onClick={() => setSelected(pool)}
                    className={cn(
                      'w-full',
                      (joined || full) && 'disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
                      !joined && !full && 'relative z-10',
                    )}
                    aria-label={
                      joined
                        ? `Already joined ${pool.name}`
                        : full
                          ? `${pool.name} is full`
                          : `View details for ${pool.name}`
                    }
                  >
                    {joined ? (
                      <>
                        <BadgeCheck className="size-4" strokeWidth={3} /> Joined
                      </>
                    ) : full ? (
                      <>
                        <ShieldCheck className="size-4" strokeWidth={3} /> Pool full
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" strokeWidth={3} /> View &amp; join
                      </>
                    )}
                  </NeoButton>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <JoinFlow
        pool={selected}
        onClose={() => setSelected(null)}
        onComplete={(pool) => {
          setJoinedIds((prev) => new Set(prev).add(pool.id))
          onJoin?.(toJoinable(pool))
        }}
        onDone={() => {
          setSelected(null)
          onDone?.()
        }}
      />
    </div>
  )
}
