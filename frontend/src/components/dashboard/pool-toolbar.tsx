import type { Pool } from '@/lib/dashboard/types'
import { neoFocus } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

export type PoolFilter = 'all' | 'hosted' | 'joined'

export function matchesFilter(pool: Pool, filter: PoolFilter) {
  if (filter === 'all') return true
  return filter === 'hosted' ? pool.role === 'host' : pool.role === 'member'
}

interface PoolToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  filter: PoolFilter
  onFilterChange: (filter: PoolFilter) => void
  counts: Record<PoolFilter, number>
}

const filters: { value: PoolFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'hosted', label: 'Hosted by me' },
  { value: 'joined', label: 'Joined' },
]

export function PoolToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
}: PoolToolbarProps) {
  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Filter pools by role"
        className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 pr-6 pt-0.5 sm:mx-0 sm:px-0"
      >
        {filters.map(({ value, label }) => {
          const active = filter === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
                active ? 'bg-mint' : 'bg-white',
                neoFocus,
              )}
            >
              {label}
              <span className="rounded-full bg-foreground px-1.5 font-mono text-xs text-background">
                {counts[value]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}