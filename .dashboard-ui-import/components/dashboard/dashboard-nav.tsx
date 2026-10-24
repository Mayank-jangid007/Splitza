import Link from 'next/link'
import { Plus, ShieldCheck, Store, Users } from 'lucide-react'
import type { DashboardRoutes } from '@/lib/dashboard/types'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'
import { Brand } from './brand'
import { MonoLabel } from './tag'

function navItems(routes: DashboardRoutes) {
  return [
    {
      title: 'Marketplace Hub',
      sub: 'Find open seats',
      href: routes.marketplace,
      icon: Store,
      active: false,
    },
    {
      title: 'My Shared Pools',
      sub: 'Hosted & joined',
      href: routes.myPools,
      icon: Users,
      active: true,
    },
  ]
}

export function CreateButton({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-foreground bg-peach font-bold',
        neoLift,
        neoFocus,
        className,
      )}
    >
      <Plus className="size-4" strokeWidth={3} aria-hidden="true" />
      {children}
    </Link>
  )
}

export function DesktopSidebar({ routes }: { routes: DashboardRoutes }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r-2 border-foreground bg-background p-5 lg:flex">
      <Brand href={routes.home} className="px-1" />

      <nav aria-label="Primary" className="mt-9 flex-1">
        <MonoLabel className="mb-3 px-2">Navigate</MonoLabel>
        <ul className="space-y-3">
          {navItems(routes).map(({ title, sub, href, icon: Icon, active }) => (
            <li key={title}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 transition-[transform,box-shadow,background-color]',
                  neoFocus,
                  active
                    ? 'border-foreground bg-mint shadow-brutal-sm'
                    : 'border-transparent hover:border-foreground hover:bg-white hover:shadow-brutal-sm',
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-white">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-foreground/70">
                    {sub}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-foreground bg-sun p-3.5 shadow-brutal-sm">
          <p className="flex items-start gap-2 text-xs font-semibold leading-relaxed">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Escrow-held. UPI payouts. Every seat verified by bot.
          </p>
        </div>
        <CreateButton href={routes.createPlan} className="h-12 w-full text-sm">
          Create a split plan
        </CreateButton>
      </div>
    </aside>
  )
}

export function MobileTopBar({ routes }: { routes: DashboardRoutes }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-foreground bg-background px-4 py-3 lg:hidden">
      <Brand href={routes.home} />
      <CreateButton href={routes.createPlan} className="h-10 px-4 text-sm">
        Create
      </CreateButton>
    </div>
  )
}

export function MobileTabBar({ routes }: { routes: DashboardRoutes }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-foreground bg-foreground p-1.5 shadow-brutal lg:hidden"
    >
      {navItems(routes).map(({ title, sub, href, icon: Icon, active }) => (
        <Link
          key={title}
          href={href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-sun',
            active ? 'bg-sun text-foreground' : 'text-background',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
          <span className="text-xs font-bold leading-tight">{title}</span>
          <span className="sr-only">{sub}</span>
        </Link>
      ))}
    </nav>
  )
}
