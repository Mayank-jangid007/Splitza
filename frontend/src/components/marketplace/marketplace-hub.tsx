'use client'

import { useMemo, useState } from 'react'
import {
  Cloud, Clapperboard, Gamepad2, GraduationCap,
  LayoutGrid, Music, Plus, Search, Shapes, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, POOLS, type Category, type MarketplacePoolFull } from '@/lib/marketplace-pools'
import { PoolCard } from './pool-card'
import { PoolDetailDialog } from './pool-detail-dialog'

type Filter = 'All' | Category

const FILTER_STYLES: Record<Filter, { icon: React.ElementType; bg: string }> = {
  All:           { icon: LayoutGrid,    bg: 'bg-mint' },
  Entertainment: { icon: Clapperboard,  bg: 'bg-bubble' },
  Music:         { icon: Music,         bg: 'bg-lilac' },
  Cloud:         { icon: Cloud,         bg: 'bg-sky' },
  Education:     { icon: GraduationCap, bg: 'bg-sun' },
  Games:         { icon: Gamepad2,      bg: 'bg-mint' },
  Others:        { icon: Shapes,        bg: 'bg-peach' },
}

export function MarketplaceHub({
  onBack,
  onCreate,
  onJoin,
}: {
  onBack: () => void
  onCreate: () => void
  onJoin: (pool: MarketplacePoolFull) => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [selected, setSelected] = useState<MarketplacePoolFull | null>(null)

  const matchesQuery = (pool: MarketplacePoolFull) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return (
      pool.name.toLowerCase().includes(term) ||
      pool.host.toLowerCase().includes(term) ||
      pool.service.toLowerCase().includes(term)
    )
  }

  const countFor = (f: Filter) =>
    POOLS.filter((p) => matchesQuery(p) && (f === 'All' || p.category === f)).length

  const visiblePools = useMemo(
    () => POOLS.filter((p) => matchesQuery(p) && (filter === 'All' || p.category === filter)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, filter],
  )

  const filters: Filter[] = ['All', ...CATEGORIES]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">

        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-foreground bg-background px-4 py-2.5 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--ink)]"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-foreground bg-peach px-4 py-2.5 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--ink)]"
          >
            <Plus className="size-4" strokeWidth={3} />
            Create pool
          </button>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Marketplace Hub</h1>
          <p className="mt-2 text-base font-medium text-foreground/70">
            Find an open seat, split the cost, and join a verified pool.
          </p>
        </div>

        {/* Search */}
        <label className="mb-6 flex h-12 items-center gap-3 rounded-2xl border-2 border-foreground bg-white px-4 shadow-[3px_3px_0_0_var(--ink)] transition focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-[5px_5px_0_0_var(--ink)]">
          <Search className="size-5 shrink-0" />
          <span className="sr-only">Search pools by name or host</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or host..."
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-foreground/50 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X className="size-4" />
            </button>
          )}
        </label>

        {/* Category filters */}
        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-4 mb-8 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {filters.map((item) => {
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
                  'flex shrink-0 items-center gap-2 rounded-full border-2 border-foreground py-1.5 pl-1.5 pr-3 text-sm font-bold transition-all duration-150',
                  active
                    ? cn(style.bg, 'translate-x-[2px] translate-y-[2px] shadow-none')
                    : 'bg-white shadow-[3px_3px_0_0_var(--ink)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--ink)]',
                  count === 0 && !active && 'opacity-50',
                )}
              >
                <span className={cn('flex size-7 items-center justify-center rounded-full border-2 border-foreground', active ? 'bg-white' : 'bg-muted')}>
                  <Icon className="size-3.5" />
                </span>
                {item}
                <span className="rounded-full bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold text-background">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Results */}
        {visiblePools.length > 0 ? (
          <>
            <p className="mb-4 text-sm font-semibold text-foreground/60">
              Showing {visiblePools.length} {visiblePools.length === 1 ? 'pool' : 'pools'}
              {filter !== 'All' && ` in ${filter}`}
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {visiblePools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} onOpen={setSelected} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border-2 border-foreground bg-white px-6 py-16 text-center shadow-[4px_4px_0_0_var(--ink)]">
            <span className="text-5xl">🔍</span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight">No pools match that</h2>
            <p className="mt-2 max-w-sm text-sm font-medium text-foreground/70">
              Try another name or category, or create your own split plan.
            </p>
            <button
              type="button"
              onClick={() => { setQuery(''); setFilter('All') }}
              className="mt-5 rounded-2xl border-2 border-foreground bg-bubble px-5 py-2.5 text-sm font-bold shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Create CTA */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border-2 border-foreground bg-sun p-6 shadow-[4px_4px_0_0_var(--ink)] sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">Paying full price for a plan?</h3>
            <p className="mt-1 text-sm font-medium text-foreground/75">
              Share the seats, get paid through escrow, and let the bot verify every member.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-foreground bg-foreground px-5 py-3 text-sm font-extrabold text-background shadow-[3px_3px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--ink)]"
          >
            <Plus className="size-4" strokeWidth={3} />
            Create a split plan
          </button>
        </div>
      </div>

      <PoolDetailDialog
        pool={selected}
        onClose={() => setSelected(null)}
        onJoin={(pool) => {
          setSelected(null)
          onJoin({ 
            id: pool.id,
            service: pool.service,
            category: pool.category,
            term: pool.cycleDays / 30,
            price: Math.ceil(pool.totalCost / pool.totalSeats),
            available: pool.seatsLeft,
            total: pool.totalSeats,
            accent: 'green',
            kind: 'PRE_STORED',
            remainingDays: pool.daysLeft,
            hostName: pool.host,
            logoUrl: pool.logo,
          })
        }}
      />
    </div>
  )
}
