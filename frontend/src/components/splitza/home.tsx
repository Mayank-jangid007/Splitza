'use client'

import type { ReactNode } from 'react'
import { Header, type View } from './header'
import { Hero } from './hero'

export function Home({
  userName = '',
  email = '',
  view = 'pools',
  onView,
  onShare,
  onBrowse,
  onWallet,
  onLogout,
  children,
}: {
  userName?: string
  email?: string
  view?: View
  onView?: (view: View) => void
  onShare?: () => void
  onBrowse?: () => void
  onWallet?: () => void
  onLogout?: () => void
  children?: ReactNode
}) {
  const handleShare = onShare ?? (() => {})
  const handleBrowse = onBrowse ?? (() => {})
  const handleWallet = onWallet ?? (() => {})
  const handleView = onView ?? (() => {})

  return (
    <div id="top" className="splitza-canvas font-neo-body">
      <div className="mx-auto my-3 max-w-[1400px] overflow-hidden rounded-[28px] border-2 border-ink bg-cream shadow-neo-lg sm:my-6 sm:rounded-[40px]">
        <Header
          view={view}
          onView={handleView}
          onShare={handleShare}
          userName={userName}
          email={email}
          onWallet={handleWallet}
          onLogout={onLogout}
        />

        <main>
          {view === 'market' && children ? (
            children
          ) : (
            <>
              <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-10 sm:px-8 sm:pt-14 sm:pb-24">
                <Hero userName={userName} onShare={handleShare} onBrowse={handleBrowse} />
              </div>
              {children}
            </>
          )}
        </main>

        <footer className="border-t-2 border-ink bg-ink px-4 py-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-paper sm:px-8">
          Splitza · Subscriptions, split safely · Payments held in escrow
        </footer>
      </div>
    </div>
  )
}
