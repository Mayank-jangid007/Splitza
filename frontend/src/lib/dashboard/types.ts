export type EscrowStep = 1 | 2 | 3 | 4

export type PoolAccent = 'lilac' | 'sun' | 'mint' | 'blush' | 'peach'

export interface Pool {
  id: string
  name: string
  logoUrl?: string
  host: string
  role: 'host' | 'member'
  isPrivate: boolean
  capacity: number
  filledSeats: number
  daysLeft: number
  totalDays: number
  pricePerSeat: number
  planMonths: number
  /** Full monthly plan cost before pro-rating (for the split formula). */
  monthlyPlanCost?: number
  escrowStep: EscrowStep
  endsOn: string
  /** Card color. Falls back to a stable color derived from the pool id. */
  accent?: PoolAccent
  /** Total plan value in INR. Falls back to pricePerSeat x capacity. */
  poolCapital?: number
}

export interface DashboardRoutes {
  home: string
  marketplace: string
  myPools: string
  createPlan: string
  sharePlan: string
  ledger: string
  /** Path template; `:id` is replaced with the pool id. */
  pool: string
  /** Path template; `:id` is replaced with the pool id. */
  invites: string
}

export function resolvePoolRoute(template: string, pool: Pool) {
  return template.replace(':id', encodeURIComponent(pool.id))
}

export const defaultRoutes: DashboardRoutes = {
  home: '/',
  marketplace: '/marketplace',
  myPools: '/dashboard',
  createPlan: '/create',
  sharePlan: '/create',
  ledger: '/ledger',
  pool: '/pools/:id',
  invites: '/pools/:id/invites',
}
