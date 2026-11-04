'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Mark } from './stickers'
import { ProfileMenu } from './profile-menu'
import { NeoButton } from './ui'

export type View = 'pools' | 'market'

const NAV: { id: View; label: string }[] = [
  { id: 'pools', label: 'My Pools' },
  { id: 'market', label: 'Marketplace' },
]

export function Header({
  view,
  onView,
  onShare,
  userName,
  email,
  avatarUrl,
  onProfile,
  onFaq,
  onFeedback,
  onLogout,
}: {
  view: View
  onView: (v: View) => void
  onShare: () => void
  userName: string
  email: string
  avatarUrl?: string | null
  onProfile: () => void
  onFaq: () => void
  onFeedback: () => void
  onLogout?: () => void
}) {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-8 sm:py-4">
        <a href="#top" className="flex items-center gap-2.5 outline-none focus-visible:ring-4 focus-visible:ring-ink/30" aria-label="Splitza home">
          <Mark className="size-10" />
          <span className="font-display-tight text-2xl font-black">splitza</span>
        </a>

        <nav
          aria-label="Primary"
          className="order-3 flex w-full gap-1 rounded-full border-2 border-ink bg-cream p-1 sm:order-none sm:w-auto"
        >
          {NAV.map((item) => {
            const active = view === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onView(item.id)}
                className={cn(
                  'h-10 flex-1 rounded-full px-5 text-sm font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ink/30 sm:flex-none sm:px-7',
                  active ? 'bg-lav shadow-[0_0_0_2px_#151515_inset]' : 'hover:bg-sun/60',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <NeoButton tone="sun" size="sm" onClick={onShare} className="hidden sm:inline-flex">
            <Plus className="size-4" strokeWidth={3.5} />
            Share a plan
          </NeoButton>
          <NeoButton tone="sun" size="sm" onClick={onShare} className="size-10 px-0 sm:hidden" aria-label="Share a plan">
            <Plus className="size-5" strokeWidth={3.5} />
          </NeoButton>
          <ProfileMenu
            name={userName}
            email={email}
            avatarUrl={avatarUrl}
            onProfile={onProfile}
            onFaq={onFaq}
            onFeedback={onFeedback}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  )
}
