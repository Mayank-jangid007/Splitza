'use client'

import { Bell, ChevronDown, MessageSquare } from 'lucide-react'
import { neoFocus } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  unreadMessages: number
  userName: string
  userInitial: string
  onOpenMessages?: () => void
  onOpenNotifications?: () => void
  onOpenProfile?: () => void
}

const iconButton = cn(
  'relative flex size-11 items-center justify-center rounded-full border-2 border-foreground bg-white shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  neoFocus,
)

export function DashboardHeader({
  unreadMessages,
  userName,
  userInitial,
  onOpenMessages,
  onOpenNotifications,
  onOpenProfile,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-base font-semibold text-foreground/70">
          Hello, {userName}
        </p>
        <h1 className="mt-1 text-4xl font-extrabold leading-none tracking-tight text-balance sm:text-5xl">
          Your shared pools
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

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label={`Profile menu for ${userName}`}
          className={cn(iconButton, 'w-auto gap-2.5 bg-sun pl-1.5 pr-3.5')}
        >
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full border-2 border-foreground bg-blush text-sm font-extrabold"
          >
            {userInitial}
          </span>
          <span className="hidden text-sm font-bold sm:inline">{userName}</span>
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
