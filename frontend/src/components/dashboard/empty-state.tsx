"use client";

import { type LucideIcon } from "lucide-react";

export function EmptyState({
  dark,
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  dark: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[var(--dash-border)] px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-ink-soft)]">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-base font-bold text-[var(--dash-ink)]">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-[var(--dash-ink-soft)]">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-2xl bg-[var(--dash-lime)] px-5 py-2.5 text-sm font-bold text-[var(--dash-lime-ink)] transition hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
