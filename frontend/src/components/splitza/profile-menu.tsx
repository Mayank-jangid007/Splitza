'use client'

import { Menu } from '@base-ui/react/menu'
import { ChevronDown, HelpCircle, LogOut, MessageSquareHeart, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from './ui'

const itemClass =
  'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold outline-none data-[highlighted]:bg-sun'

export function ProfileMenu({
  name,
  email,
  avatarUrl,
  onProfile,
  onFaq,
  onFeedback,
  onLogout,
}: {
  name: string
  email: string
  avatarUrl?: string | null
  onProfile: () => void
  onFaq: () => void
  onFeedback: () => void
  onLogout?: () => void
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Open profile menu"
        className="group flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ink/30"
      >
        <Avatar name={name} avatarUrl={avatarUrl} index={4} size={42} className="shadow-neo-sm" />
        <ChevronDown
          className="size-4 transition-transform group-data-[popup-open]:rotate-180"
          strokeWidth={3}
          aria-hidden="true"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={10} className="z-50">
          <Menu.Popup
            className={cn(
              'w-72 origin-top-right rounded-3xl border-2 border-ink bg-paper p-2 shadow-neo outline-none transition duration-150',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            )}
          >
            <div className="mb-2 flex items-center gap-3 rounded-2xl border-2 border-ink bg-lav p-3">
              <Avatar name={name} avatarUrl={avatarUrl} index={1} size={44} />
              <div className="min-w-0">
                <p className="truncate font-display-tight text-lg font-black">{name}</p>
                <p className="truncate text-xs">{email}</p>
              </div>
            </div>

            <Menu.Item className={itemClass} onClick={onProfile}>
              <UserRound className="size-4" strokeWidth={3} aria-hidden="true" />
              Profile
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onFaq}>
              <HelpCircle className="size-4" strokeWidth={3} aria-hidden="true" />
              FAQ
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onFeedback}>
              <MessageSquareHeart className="size-4" strokeWidth={3} aria-hidden="true" />
              Feedback
            </Menu.Item>
            <Menu.Separator className="my-1.5 h-0.5 bg-ink" />
            <Menu.Item className={cn(itemClass, 'data-[highlighted]:bg-tang')} onClick={onLogout}>
              <LogOut className="size-4" strokeWidth={3} aria-hidden="true" />
              Log out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
