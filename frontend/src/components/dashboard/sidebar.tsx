"use client";

import { Layers, Plus, ShoppingBag } from "lucide-react";

export type DashboardSection = "pools";

const NAV_ITEMS: { id: DashboardSection; label: string; icon: React.ElementType }[] = [
  { id: "pools", label: "My Pools", icon: Layers },
];

export function DashboardSidebar({
  dark,
  active,
  onChange,
  onBrowseMarketplace,
  onCreate,
}: {
  dark: boolean;
  active: DashboardSection;
  onChange: (s: DashboardSection) => void;
  onBrowseMarketplace: () => void;
  onCreate: () => void;
}) {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col gap-2 lg:flex">
      {/* Logo */}
      <a
        href="/"
        className="mb-4 flex items-center gap-2.5"
        aria-label="Splitza home"
      >
        <span className="grid size-9 place-items-center rounded-xl border-2 border-[var(--dash-border)] bg-[var(--dash-lime)] font-black text-[var(--dash-lime-ink)]">
          S
        </span>
        <span className="font-mono text-base font-black tracking-[-0.06em] text-[var(--dash-ink)]">
          SplitZa
        </span>
      </a>

      {/* Nav */}
      <nav aria-label="Dashboard sections">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={[
              "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
              active === id
                ? "bg-[var(--dash-surface-strong)] text-[var(--dash-ink)]"
                : "text-[var(--dash-ink-soft)] hover:bg-[var(--dash-surface)] hover:text-[var(--dash-ink)]",
            ].join(" ")}
            aria-current={active === id ? "page" : undefined}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="my-2 h-px bg-[var(--dash-border)]" />

      {/* Quick actions */}
      <button
        type="button"
        onClick={onBrowseMarketplace}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--dash-ink-soft)] transition hover:bg-[var(--dash-surface)] hover:text-[var(--dash-ink)]"
      >
        <ShoppingBag size={16} />
        Marketplace
      </button>

      <button
        type="button"
        onClick={onCreate}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--dash-lime)] px-4 py-3 text-sm font-bold text-[var(--dash-lime-ink)] transition hover:opacity-90"
      >
        <Plus size={16} />
        New Pool
      </button>
    </aside>
  );
}

export function MobileSectionNav({
  active,
  onChange,
  onBrowseMarketplace,
}: {
  active: DashboardSection;
  onChange: (s: DashboardSection) => void;
  onBrowseMarketplace: () => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
      {NAV_ITEMS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={[
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition",
            active === id
              ? "bg-[var(--dash-ink)] text-[var(--dash-canvas)]"
              : "border border-[var(--dash-border)] text-[var(--dash-ink-soft)] hover:border-[var(--dash-ink)] hover:text-[var(--dash-ink)]",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={onBrowseMarketplace}
        className="shrink-0 rounded-full border border-[var(--dash-border)] px-4 py-1.5 text-xs font-bold text-[var(--dash-ink-soft)] transition hover:border-[var(--dash-ink)] hover:text-[var(--dash-ink)]"
      >
        Marketplace
      </button>
    </div>
  );
}
