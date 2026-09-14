"use client";

import { motion } from "motion/react";
import { Check, Lock } from "lucide-react";
import { type Service } from "@/components/hosted-plans";

export function PoolCard({
  service,
  dark,
  index,
  onOpen,
}: {
  service: Service;
  dark: boolean;
  index: number;
  onOpen: (s: Service) => void;
}) {
  const available = service.capacity - service.filled;
  const fillPct = Math.round((service.filled / service.capacity) * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(service)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(service);
        }
      }}
      className="group flex cursor-pointer flex-col gap-4 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--dash-surface-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dash-lime)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[var(--dash-border)] bg-white shadow-sm">
            {service.logoUrl ? (
              <img
                src={service.logoUrl}
                alt={`${service.name} logo`}
                className="size-6 object-contain"
              />
            ) : (
              <span className="text-base font-black text-slate-900">
                {service.brand ?? service.name.charAt(0)}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[var(--dash-ink)]">
              {service.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-[var(--dash-ink-soft)]">
              by {service.host}
            </p>
          </div>
        </div>

        <span
          className={[
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
            service.private
              ? "bg-violet-500/15 text-violet-400"
              : "bg-emerald-500/15 text-emerald-400",
          ].join(" ")}
        >
          {service.private ? <Lock size={10} /> : <Check size={10} />}
          {service.private ? "Private" : "Public"}
        </span>
      </div>

      {/* Seat fill */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
          <span className="text-[var(--dash-ink)]">
            {service.filled}/{service.capacity} filled
          </span>
          <span className="text-[var(--dash-ink-soft)]">{available} open</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--dash-border)]">
          <div
            className="h-full rounded-full bg-[var(--dash-lime)] transition-all"
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--dash-ink-soft)]">
            per seat
          </p>
          <p className="mt-0.5 text-2xl font-black tracking-tight text-[var(--dash-ink)]">
            ₹{service.price}
            <span className="ml-1 text-xs font-normal text-[var(--dash-ink-soft)]">
              /mo
            </span>
          </p>
        </div>
        <span className="rounded-xl bg-[var(--dash-surface-strong)] px-3 py-1.5 text-[10px] font-bold text-[var(--dash-ink-soft)]">
          {available === 0 ? "FULL" : fillPct >= 60 ? "ACTIVE" : "OPEN"}
        </span>
      </div>
    </motion.article>
  );
}
