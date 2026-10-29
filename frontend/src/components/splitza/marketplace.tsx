'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Cloud, Clapperboard, Gamepad2, GraduationCap,
  LayoutGrid, Loader2, Music, Plus, Search, Shapes, X, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, POOLS as DEMO_POOLS, type Category, type Pool } from '@/lib/pools'
import type { MarketplacePool } from '@/components/marketplace-view'
import { poolsApi, type MarketplacePoolItem } from '@/lib/api'
import { HeroBanner } from './hero-banner'
import { PoolCard } from './pool-card'
import { PoolDetailDialog } from './pool-detail-dialog'

type Filter = 'All' | Category

const TONES = ['sun', 'bubble', 'mint', 'lilac', 'peach', 'sky'] as const
type Tone = (typeof TONES)[number]

const FILTER_STYLES: Record<Filter, { icon: LucideIcon; bg: string }> = {
  All:           { icon: LayoutGrid,    bg: 'bg-mint' },
  Entertainment: { icon: Clapperboard,  bg: 'bg-bubble' },
  Music:         { icon: Music,         bg: 'bg-lilac' },
  Cloud:         { icon: Cloud,         bg: 'bg-sky' },
  Education:     { icon: GraduationCap, bg: 'bg-sun' },
  Games:         { icon: Gamepad2,      bg: 'bg-mint' },
  Others:        { icon: Shapes,        bg: 'bg-peach' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Map a backend MarketplacePoolItem → the Pool shape used by PoolCard / PoolDetailDialog */
function apiItemToPool(item: MarketplacePoolItem, index: number): Pool {
  const tone = TONES[index % TONES.length]

  // Try to guess a category from the platform name
  const nameLower = item.platformName.toLowerCase()
  let category: Category = 'Others'
  if (['netflix', 'disney', 'hotstar', 'prime', 'youtube', 'zee', 'sony'].some(k => nameLower.includes(k))) category = 'Entertainment'
  else if (['spotify', 'apple music', 'jiosaavn', 'gaana', 'wynk'].some(k => nameLower.includes(k))) category = 'Music'
  else if (['google one', 'icloud', 'dropbox', 'onedrive', 'microsoft', 'box'].some(k => nameLower.includes(k))) category = 'Cloud'
  else if (['duolingo', 'coursera', 'skillshare', 'udemy', 'linkedin learning'].some(k => nameLower.includes(k))) category = 'Education'
  else if (['xbox', 'playstation', 'ps plus', 'ea play', 'nintendo', 'steam'].some(k => nameLower.includes(k))) category = 'Games'

  return {
    id:          item.id,
    name:        item.platformName,
    service:     item.platformName,
    category,
    host:        item.hostName,
    hostHandle:  `@${item.hostName.toLowerCase().replace(/\s+/g, '.')}`,
    logo:        item.platformLogoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(item.platformName)}&background=random&size=64`,
    totalCost:   item.pricePerSeat * item.maxSeats,
    totalSeats:  item.maxSeats,
    seatsLeft:   item.openSeats,
    daysLeft:    item.planMonths * 30,
    cycleDays:   item.planMonths * 30,
    tone,
    perks:       [],
    description: `A ${item.planMonths}-month shared plan hosted by ${item.hostName}. ${item.openSeats} seat${item.openSeats !== 1 ? 's' : ''} available.`,
    rules:       ['Pay on time each billing cycle.', 'Do not share your credentials outside the pool.'],
    hostRating:  item.hostTrustScore ?? 4.5,
    hostPools:   1,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface MarketplaceProps {
  onCreatePlan?: () => void
  onJoin?: (pool: MarketplacePool) => void
}

export function Marketplace({ onCreatePlan, onJoin }: MarketplaceProps) {
  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState<Filter>('All')
  const [selected, setSelected] = useState<Pool | null>(null)

  // Live API data
  const [livePools,  setLivePools]  = useState<Pool[]>([])
  const [loading,    setLoading]    = useState(true)
  const [apiError,   setApiError]   = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setApiError(null)

    poolsApi.getMarketplace({ hasOpenSeats: false })
      .then((res) => {
        if (cancelled) return
        if (res.ok && Array.isArray(res.data)) {
          setLivePools(res.data.map((item, i) => apiItemToPool(item, i)))
        }
      })
      .catch((err) => {
        if (cancelled) return
        // Non-fatal — fall back to demo data silently but show a soft warning
        setApiError(err?.message ?? 'Could not load live pools')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // Merge: live pools first, then demo pools (de-duplicated by name)
  const allPools: Pool[] = useMemo(() => {
    const liveNames = new Set(livePools.map(p => p.name.toLowerCase()))
    const dedupedDemo = DEMO_POOLS.filter(p => !liveNames.has(p.name.toLowerCase()))
    return [...livePools, ...dedupedDemo]
  }, [livePools])

  const matchesQuery = (pool: Pool) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return (
      pool.name.toLowerCase().includes(term) ||
      pool.host.toLowerCase().includes(term) ||
      pool.hostHandle.toLowerCase().includes(term) ||
      pool.service.toLowerCase().includes(term)
    )
  }

  const countFor = (category: Filter) =>
    allPools.filter((pool) => matchesQuery(pool) && (category === 'All' || pool.category === category)).length

  const visiblePools = useMemo(
    () => allPools.filter((pool) => matchesQuery(pool) && (filter === 'All' || pool.category === filter)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, filter, allPools],
  )

  const filters: Filter[] = ['All', ...CATEGORIES]

  return (
    <div className="flex flex-col gap-8">
      <HeroBanner />

      {/* Live indicator */}
      {!loading && livePools.length > 0 && (
        <div className="flex items-center gap-2 rounded-full border-2 border-ink/20 bg-white px-4 py-2 text-xs font-bold w-fit">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          {livePools.length} live pool{livePools.length !== 1 ? 's' : ''} from community hosts
        </div>
      )}
      {apiError && (
        <p className="text-xs text-amber-600 font-medium">
          ⚠ Could not reach server — showing demo pools only.
        </p>
      )}

      {/* Search + filters */}
      <section id="browse-pools" aria-label="Search and filter pools" className="flex scroll-mt-6 flex-col gap-5">
        <div className="brut flex items-center gap-3 rounded-full bg-white py-2 pr-2 pl-5 focus-within:ring-4 focus-within:ring-ink/20">
          <Search className="size-5 shrink-0" aria-hidden="true" />
          <label htmlFor="pool-search" className="sr-only">Search plans by name or host</label>
          <input
            id="pool-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans by name or host"
            className="h-10 min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-ink/50 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
              className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-sun">
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div role="group" aria-label="Filter by category"
          className="-mx-1 flex gap-3 overflow-x-auto px-1 pt-1.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((item) => {
            const active = filter === item
            const style = FILTER_STYLES[item]
            const Icon = style.icon
            const count = countFor(item)
            return (
              <button key={item} type="button" aria-pressed={active} onClick={() => setFilter(item)}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-full border-[2.5px] border-ink py-1.5 pr-3 pl-1.5 font-bold transition-all duration-150',
                  active
                    ? cn(style.bg, 'translate-x-[2px] translate-y-[2px] shadow-[0_0_0_0_var(--ink)]')
                    : 'bg-white shadow-brut-sm hover:-translate-y-0.5 hover:shadow-brut',
                  count === 0 && !active && 'opacity-60',
                )}
              >
                <span className={cn('grid size-8 place-items-center rounded-full border-2 border-ink transition-colors', active ? 'bg-white' : style.bg)}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {item}
                <span className={cn('grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 font-mono text-xs', active ? 'bg-ink text-cream' : 'bg-ink/10 text-ink')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Pool grid */}
      <section aria-label="Available pools" className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-ink/60 font-medium">
            <Loader2 className="size-5 animate-spin" />
            Loading live pools…
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-ink/70" aria-live="polite">
              Showing {visiblePools.length} {visiblePools.length === 1 ? 'pool' : 'pools'}
              {filter !== 'All' && ` in ${filter}`}
            </p>

            {visiblePools.length > 0 ? (
              <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {visiblePools.map((pool) => (
                  <li key={pool.id} className="flex">
                    <PoolCard pool={pool} seatsLeft={pool.seatsLeft} joined={false} onOpen={setSelected} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="brut flex flex-col items-center gap-4 rounded-[2rem] bg-white p-8 text-center">
                <div className="brut-sm flex size-20 items-center justify-center rounded-3xl bg-sun text-4xl">🔍</div>
                <h3 className="text-2xl font-extrabold tracking-tight">No pools match that</h3>
                <p className="max-w-sm text-ink/70">Try another name, host, or category. Or start your own pool and let people come to you.</p>
                <button type="button" onClick={() => { setQuery(''); setFilter('All') }}
                  className="brut-sm brut-press rounded-full bg-bubble px-5 py-2.5 font-bold">
                  Reset filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA banner */}
      <section aria-label="Host your own plan"
        className="brut relative flex flex-col items-start gap-5 overflow-hidden rounded-[2.5rem] border-[2.5px] border-ink bg-lilac p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div className="flex max-w-md flex-col gap-3">
          <h2 className="text-3xl font-extrabold tracking-tighter text-balance">Paying full price for a plan?</h2>
          <p className="font-medium text-ink/80">Share the seats, get paid through escrow, and let the bot verify every member.</p>
          <button
            type="button"
            onClick={onCreatePlan}
            className="brut-sm brut-press mt-1 flex w-fit items-center gap-2 rounded-full bg-sun px-5 py-3 font-bold"
          >
            <Plus className="size-5" aria-hidden="true" />
            Create a split plan
          </button>
        </div>
      </section>

      <PoolDetailDialog
        pool={selected}
        seatsLeft={selected ? selected.seatsLeft : 0}
        joined={false}
        onClose={() => setSelected(null)}
        onJoin={(pool) => {
          setSelected(null)
          onJoin?.({
            id: pool.id,
            service: pool.service,
            category: pool.category,
            term: pool.cycleDays / 30,
            price: Math.ceil(pool.totalCost / pool.totalSeats),
            available: pool.seatsLeft,
            total: pool.totalSeats,
            accent: 'green' as const,
            kind: 'PRE_STORED' as const,
            remainingDays: pool.daysLeft,
            hostName: pool.host,
            logoUrl: pool.logo,
          })
        }}
      />
    </div>
  )
}
