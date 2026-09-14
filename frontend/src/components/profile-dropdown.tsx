"use client"

import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  LogOut,
  MessageCircle,
  UserRound,
  Wallet,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function ProfileDropdown() {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeProfile(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", closeProfile)

    return () => {
      document.removeEventListener("mousedown", closeProfile)
    }
  }, [])

  return (
    <div ref={profileRef} className="relative">
      <button
        aria-label="Open profile menu"
        aria-expanded={profileOpen}
        onClick={() => setProfileOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-strong)] py-1 pl-1 pr-2.5 font-bold text-[var(--dash-ink)] transition hover:bg-[var(--dash-surface-strong)] hover:border-[var(--dash-ink-soft)]"
      >
        <span className="grid size-7 place-items-center rounded-full bg-[var(--dash-violet)] font-black uppercase text-[var(--dash-violet-ink)] text-sm">
          {user?.name?.charAt(0) || "U"}
        </span>
        <span className="hidden text-xs font-semibold sm:block">
          {user?.name?.split(" ")[0] || "Account"}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`text-[var(--dash-ink-soft)] transition-transform duration-200 ${
            profileOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        role="menu"
        aria-label="Profile menu"
        aria-hidden={!profileOpen}
        className={`absolute right-0 top-12 z-50 w-56 origin-top-right rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 shadow-xl transition-all duration-200 ease-out ${
          profileOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        {/* User info */}
        <div className="border-b border-[var(--dash-border)] px-3 pb-3 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--dash-violet)] font-black uppercase text-[var(--dash-violet-ink)]">
              {user?.name?.charAt(0) || "U"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[var(--dash-ink)]">
                {user?.name || "User"}
              </p>
              <p className="truncate text-[10px] text-[var(--dash-ink-soft)]">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-0.5">
          <ProfileMenuItem icon={<UserRound size={14} />} label="Profile" onClick={() => alert("Opening Profile...")} />
          <ProfileMenuItem icon={<MessageCircle size={14} />} label="Feedback" onClick={() => alert("Opening Feedback...")} />
          <ProfileMenuItem icon={<Wallet size={14} />} label="My wallet" onClick={() => alert("Opening Wallet...")} />

          <div className="my-1 border-t border-[var(--dash-border)]" />

          <ProfileMenuItem icon={<LogOut size={14} />} label="Sign out" danger onClick={() => logout()} />
        </div>
      </div>
    </div>
  )
}

function ProfileMenuItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
        danger
          ? "text-red-500 hover:bg-red-500/10 hover:text-red-500"
          : "text-[var(--dash-ink)] hover:bg-[var(--dash-surface-strong)]"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-[var(--dash-ink-soft)]"}>
        {icon}
      </span>
      {label}
    </button>
  )
}
