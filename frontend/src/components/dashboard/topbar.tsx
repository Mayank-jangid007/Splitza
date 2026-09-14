"use client";

import { Plus, Search } from "lucide-react";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";
import ProfileDropdown from "@/components/profile-dropdown";

export function DashboardTopbar({
  dark,
  onToggleTheme,
  search,
  onSearchChange,
  sectionTitle,
  sectionMeta,
  onCreate,
}: {
  dark: boolean;
  onToggleTheme: () => void;
  search: string;
  onSearchChange: (v: string) => void;
  sectionTitle: string;
  sectionMeta: string;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-center gap-3">
        {/* Section info */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--dash-ink-soft)]">
            {sectionMeta}
          </p>
          <h1 className="mt-0.5 text-xl font-black tracking-tight text-[var(--dash-ink)]">
            {sectionTitle}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-2">
          <AnimatedThemeToggler dark={dark} onToggle={onToggleTheme} />

          <ProfileDropdown />

          <button
            type="button"
            onClick={onCreate}
            className="hidden items-center gap-2 rounded-full bg-[var(--dash-lime)] px-4 py-2 text-xs font-bold text-[var(--dash-lime-ink)] transition hover:opacity-90 sm:flex"
          >
            <Plus size={14} />
            New Pool
          </button>
        </div>
      </div>

      {/* Search */}
      <label className="flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5 transition focus-within:border-[var(--dash-ink)]">
        <Search size={15} className="shrink-0 text-[var(--dash-ink-soft)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search pools or hosts…"
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--dash-ink)] outline-none placeholder:text-[var(--dash-ink-soft)]"
          aria-label="Search pools"
        />
      </label>
    </div>
  );
}
