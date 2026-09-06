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
        className="flex items-center gap-1.5 rounded-full border-[3px] border-black bg-violet-300 py-1 pl-1 pr-2 font-black text-slate-950 shadow-[3px_3px_0_#34d399] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#34d399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#34d399]"
      >
        <span className="grid size-7 place-items-center rounded-full bg-violet-300 uppercase">
          {user?.name?.charAt(0) || "U"}
        </span>

        <ChevronDown
          size={14}
          strokeWidth={3}
          className={`transition-transform duration-200 ${
            profileOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        role="menu"
        aria-label="Profile menu"
        aria-hidden={!profileOpen}
        className={`absolute right-0 top-12 z-50 w-52 origin-top-right rounded-xl border-[3px] border-black p-2 shadow-[5px_5px_0_#34d399] transition-all duration-200 ease-out ${
          profileOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        } bg-slate-950 text-slate-100`}
      >
        <div className="border-b-2 border-slate-700 px-3 pb-2 pt-1">
          <p className="font-mono text-xs font-black">{user?.name || "User"}</p>
          <p className="mt-1 font-mono text-[9px] text-slate-500">
            {user?.email || ""}
          </p>
        </div>

        <ProfileMenuItem icon={<UserRound size={15} />} label="Profile" onClick={() => alert("Opening Profile...")} />
        <ProfileMenuItem icon={<MessageCircle size={15} />} label="Feedback" onClick={() => alert("Opening Feedback...")} />
        <ProfileMenuItem icon={<Wallet size={15} />} label="My wallet" onClick={() => alert("Opening Wallet...")} />

        <div className="my-1 border-t border-slate-700" />

        <ProfileMenuItem icon={<LogOut size={15} />} label="Sign out" danger onClick={() => logout()} />
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
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-mono text-[10px] font-black transition hover:translate-x-0.5 ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-slate-200 hover:bg-emerald-300/10 hover:text-emerald-300"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
