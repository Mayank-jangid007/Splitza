'use client'

import { useState, useEffect } from 'react'
import { Bell, ChevronDown, LogOut, MessageSquare, Wallet, MessageSquarePlus } from 'lucide-react'
import { neoFocus } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  unreadMessages: number
  userName: string
  userInitial: string
  title?: string
  showGreeting?: boolean
  onOpenMessages?: () => void
  onOpenNotifications?: () => void
  onOpenProfile?: () => void
  onOpenWallet?: () => void
  onOpenFeedback?: () => void
  onLogout?: () => void
}

const iconButton = cn(
  'relative flex size-11 items-center justify-center rounded-full border-2 border-foreground bg-white shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  neoFocus,
)

export function DashboardHeader({
  unreadMessages,
  userName,
  userInitial,
  title = 'Your shared pools',
  showGreeting = true,
  onOpenMessages,
  onOpenNotifications,
  onOpenProfile,
  onOpenWallet,
  onOpenFeedback,
  onLogout,
}: DashboardHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const displayName = mounted ? userName : ''
  const displayInitial = mounted ? userInitial : ''

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {showGreeting && (
          <p className="text-base font-semibold text-foreground/70">
            Hello, {displayName}
          </p>
        )}
        <h1 className="mt-1 text-4xl font-extrabold leading-none tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMessages}
          aria-label={
            unreadMessages > 0
              ? `Messages, ${unreadMessages} unread`
              : 'Messages'
          }
          className={iconButton}
        >
          <MessageSquare className="size-5" aria-hidden="true" />
          {unreadMessages > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-foreground bg-blush px-1 text-[11px] font-extrabold"
            >
              {unreadMessages}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className={iconButton}
        >
          <Bell className="size-5" aria-hidden="true" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label={`Profile menu for ${displayName}`}
            aria-expanded={profileOpen}
            className={cn(iconButton, 'w-auto gap-2.5 bg-sun pl-1.5 pr-3.5')}
          >
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full border-2 border-foreground bg-blush text-sm font-extrabold"
            >
              {displayInitial}
            </span>
            <span className="hidden text-sm font-bold sm:inline">{displayName}</span>
            <ChevronDown className={cn('size-4 transition-transform', profileOpen && 'rotate-180')} aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border-2 border-foreground bg-white shadow-brutal-lg z-50">
              <nav className="space-y-1 p-2">
                <button
                  onClick={() => {
                    onOpenProfile?.()
                    setProfileOpen(false)
                  }}
                  aria-label={`Profile menu for ${displayName}`}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-background transition-colors"
                >
                  <span className="flex size-8 items-center justify-center rounded-full border-2 border-foreground bg-blush text-xs font-extrabold">
                    {displayInitial}
                  </span>
                  <div>
                    <div className="font-bold">{displayName}</div>
                    <div className="text-xs text-foreground/70">View profile</div>
                  </div>
                </button>

                <div className="my-2 border-t-2 border-foreground" />

                <button
                  onClick={() => {
                    onOpenWallet?.()
                    setProfileOpen(false)
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-background transition-colors"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-sun">
                    <Wallet className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-bold">My Wallet</div>
                    <div className="text-xs text-foreground/70">Manage funds</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenFeedback?.()
                    setProfileOpen(false)
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-background transition-colors"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-mint">
                    <MessageSquarePlus className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="font-bold">Feedback</div>
                    <div className="text-xs text-foreground/70">Send feedback</div>
                  </div>
                </button>

                <div className="my-2 border-t-2 border-foreground" />

                <button
                  onClick={() => {
                    onLogout?.()
                    setProfileOpen(false)
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-blush transition-colors"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-blush">
                    <LogOut className="size-4" aria-hidden="true" />
                  </span>
                  <div className="font-bold">Logout</div>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
