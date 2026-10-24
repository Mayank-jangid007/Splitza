"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  MessageCircle,
  UserRound,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { neoFocus } from "@/lib/dashboard/neo";
import { cn } from "@/lib/utils";

const triggerClass = cn(
  "relative flex w-auto items-center gap-2.5 rounded-full border-2 border-foreground bg-sun py-1 pl-1.5 pr-3.5 shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  neoFocus,
);

export function NeoProfileMenu() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayName = user?.name?.split(" ")[0] || "Account";
  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  if (!mounted) {
    return (
      <div className="relative">
        <button type="button" className={triggerClass} aria-label="Profile menu">
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-foreground bg-blush text-sm font-extrabold">
            U
          </span>
          <span className="hidden text-sm font-bold sm:inline">Account</span>
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Profile menu for ${user?.name || "Account"}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
      >
        <span className="flex size-8 items-center justify-center rounded-full border-2 border-foreground bg-blush text-sm font-extrabold">
          {initial}
        </span>
        <span className="hidden text-sm font-bold sm:inline">{displayName}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        role="menu"
        aria-label="Profile menu"
        aria-hidden={!open}
        className={cn(
          "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 origin-top-right rounded-2xl border-2 border-foreground bg-white p-2 shadow-brutal transition-all duration-200",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0",
        )}
      >
        <div className="border-b-2 border-foreground/10 px-3 pb-3 pt-2">
          <p className="truncate text-xs font-bold">{user?.name || "User"}</p>
          <p className="truncate text-[10px] font-medium text-foreground/60">
            {user?.email || ""}
          </p>
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <MenuItem
            icon={<UserRound className="size-3.5" />}
            label="Profile"
            onClick={() => {
              setOpen(false);
              alert("Opening Profile...");
            }}
          />
          <MenuItem
            icon={<MessageCircle className="size-3.5" />}
            label="Feedback"
            onClick={() => {
              setOpen(false);
              alert("Opening Feedback...");
            }}
          />
          <MenuItem
            icon={<Wallet className="size-3.5" />}
            label="My wallet"
            onClick={() => {
              setOpen(false);
              alert("Opening Wallet...");
            }}
          />
          <div className="my-1 border-t-2 border-foreground/10" />
          <MenuItem
            icon={<LogOut className="size-3.5" />}
            label="Sign out"
            danger
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-foreground hover:bg-mint/40",
      )}
    >
      <span className={danger ? "text-red-600" : "text-foreground/60"}>{icon}</span>
      {label}
    </button>
  );
}
