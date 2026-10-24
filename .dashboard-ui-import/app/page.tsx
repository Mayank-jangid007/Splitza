import { DashboardView } from '@/components/dashboard/dashboard-view'
import { samplePools } from '@/lib/dashboard/sample-data'

export default function Page() {
  return (
    <DashboardView
      pools={samplePools}
      userName="Aarav"
      unreadMessages={3}
      routes={{
        home: '/',
        marketplace: '#marketplace',
        myPools: '/',
        createPlan: '#create',
        sharePlan: '#create',
        ledger: '#ledger',
        pool: '#pool-:id',
        invites: '#invites-:id',
      }}
    />
  )
}
