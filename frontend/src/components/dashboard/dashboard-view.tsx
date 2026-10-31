'use client'

import { useMemo, useState } from 'react'
import {
  defaultRoutes,
  type DashboardRoutes,
  type Pool,
} from '@/lib/dashboard/types'
import { matchesQuery } from '@/lib/dashboard/pool-utils'
import { AllPoolsDialog } from './all-pools-dialog'
import { DashboardHeader } from './dashboard-header'
import {
  DesktopSidebar,
  MobileTabBar,
  MobileTopBar,
} from './dashboard-nav'
import { OverviewCard } from './overview-card'
import { PoolDetailsDialog } from './pool-details-dialog'
import { PoolToolbar, matchesFilter, type PoolFilter } from './pool-toolbar'
import { PoolsSection } from './pools-section'
import { QuickActions } from './quick-actions'

interface DashboardViewProps {
  pools: Pool[]
  userName: string
  unreadMessages?: number
  routes?: DashboardRoutes
  // action callbacks (replaces Link hrefs when provided)
  onBrowseMarketplace?: () => void
  onMyPools?: () => void
  onCreatePlan?: () => void
  onSharePlan?: () => void
  onLogout?: () => void
  onOpenWallet?: () => void
  onOpenFeedback?: () => void
  userEmail?: string
  /** When provided, renders this content instead of the pools view */
  marketplaceContent?: React.ReactNode
  isBrowsing?: boolean
}

export function DashboardView({
  pools,
  userName,
  unreadMessages = 0,
  routes = defaultRoutes,
  onBrowseMarketplace,
  onMyPools,
  onCreatePlan,
  onSharePlan,
  onLogout,
  onOpenWallet,
  onOpenFeedback,
  userEmail,
  marketplaceContent,
  isBrowsing = false,
}: DashboardViewProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<PoolFilter>('all')
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [allPoolsOpen, setAllPoolsOpen] = useState(false)

  const counts = useMemo<Record<PoolFilter, number>>(
    () => ({
      all: pools.length,
      hosted: pools.filter((pool) => matchesFilter(pool, 'hosted')).length,
      joined: pools.filter((pool) => matchesFilter(pool, 'joined')).length,
    }),
    [pools],
  )

  const filteredPools = useMemo(
    () =>
      pools.filter(
        (pool) => matchesQuery(pool, query) && matchesFilter(pool, filter),
      ),
    [pools, query, filter],
  )

  return (
    <div className="min-h-dvh bg-dots">
      <DesktopSidebar
        routes={routes}
        onBrowse={onBrowseMarketplace}
        onMyPools={onMyPools}
        onCreate={onCreatePlan}
        isBrowsing={isBrowsing}
      />
      <MobileTopBar routes={routes} onCreate={onCreatePlan} />

      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-8 sm:px-8 lg:pb-16 lg:pt-12">
          <DashboardHeader
            unreadMessages={unreadMessages}
            userName={userName}
            userInitial={userName.charAt(0).toUpperCase()}
            userEmail={userEmail}
            title={isBrowsing ? 'Marketplace Hub' : 'Your shared pools'}
            showGreeting={!isBrowsing}
            onOpenWallet={onOpenWallet}
            onOpenFeedback={onOpenFeedback}
            onLogout={onLogout}
          />

          {marketplaceContent ? (
            <div className="mt-8">{marketplaceContent}</div>
          ) : (
            <>
              <div className="mt-8">
                <OverviewCard
                  pools={pools}
                  shareHref={routes.sharePlan}
                  joinHref={routes.marketplace}
                  onShare={onSharePlan}
                  onJoin={onBrowseMarketplace}
                />
              </div>

              <div className="mt-8">
                <PoolToolbar
                  query={query}
                  onQueryChange={setQuery}
                  filter={filter}
                  onFilterChange={setFilter}
                  counts={counts}
                />
              </div>

              <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
                <PoolsSection
                  pools={filteredPools}
                  hasAnyPools={pools.length > 0}
                  createHref={routes.createPlan}
                  onCreate={onCreatePlan}
                  onSelectPool={setSelectedPool}
                  onViewAll={() => setAllPoolsOpen(true)}
                />
                <QuickActions
                  joinHref={routes.marketplace}
                  shareHref={routes.sharePlan}
                  onJoin={onBrowseMarketplace}
                  onShare={onSharePlan}
                />
              </div>
            </>
          )}
        </main>
      </div>

      <MobileTabBar routes={routes} onBrowse={onBrowseMarketplace} onMyPools={onMyPools} isBrowsing={isBrowsing} />

      <AllPoolsDialog
        open={allPoolsOpen}
        pools={pools}
        onOpenChange={setAllPoolsOpen}
        onSelectPool={setSelectedPool}
      />
      <PoolDetailsDialog
        pool={selectedPool}
        routes={routes}
        onClose={() => setSelectedPool(null)}
      />
    </div>
  )
}
