"use client";

import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Check, Lock, X } from "lucide-react";
import { type Service } from "@/components/hosted-plans";

export function PoolDrawer({
  service,
  dark,
  onClose,
  onViewFull,
  onShare,
}: {
  service: Service | null;
  dark: boolean;
  onClose: () => void;
  onViewFull: (s: Service) => void;
  onShare: (s: Service) => void;
}) {
  const available = service ? service.capacity - service.filled : 0;
  const fillPct = service
    ? Math.round((service.filled / service.capacity) * 100)
    : 0;

  return (
    <AnimatePresence>
      {service && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${service.name} pool details`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-l border-[var(--dash-border)] bg-[var(--dash-canvas)] p-6 shadow-2xl"
          >
            {/* Close */}
            <button
              type="button"
              aria-label="Close pool details"
              onClick={onClose}
              className="mb-6 self-end grid size-9 place-items-center rounded-full border border-[var(--dash-border)] text-[var(--dash-ink-soft)] transition hover:bg-[var(--dash-surface-strong)] hover:text-[var(--dash-ink)]"
            >
              <X size={16} />
            </button>

            {/* Logo + name */}
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-3xl border border-[var(--dash-border)] bg-white shadow">
                {service.logoUrl ? (
                  <img
                    src={service.logoUrl}
                    alt={`${service.name} logo`}
                    className="size-9 object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-slate-900">
                    {service.brand ?? service.name.charAt(0)}
                  </span>
                )}
              </span>
              <div>
                <h2 className="text-xl font-black text-[var(--dash-ink)]">
                  {service.name}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--dash-ink-soft)]">
                  Hosted by {service.host}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  service.private
                    ? "bg-violet-500/15 text-violet-400"
                    : "bg-emerald-500/15 text-emerald-400",
                ].join(" ")}
              >
                {service.private ? <Lock size={11} /> : <Check size={11} />}
                {service.private ? "Private Pool" : "Public Pool"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--dash-surface-strong)] px-3 py-1 text-xs font-bold text-[var(--dash-ink-soft)]">
                {service.planMonths}mo plan
              </span>
            </div>

            {/* Seats */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--dash-ink)]">
                  {service.filled} of {service.capacity} seats filled
                </span>
                <span className="text-[var(--dash-ink-soft)]">
                  {available} open
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--dash-border)]">
                <div
                  className="h-full rounded-full bg-[var(--dash-lime)] transition-all"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <div className="mt-3 flex gap-1.5" aria-hidden="true">
                {Array.from({ length: service.capacity }, (_, i) => (
                  <span
                    key={i}
                    className={[
                      "flex-1 rounded-full py-1",
                      i < service.filled
                        ? "bg-[var(--dash-lime)]"
                        : "bg-[var(--dash-border)]",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mt-6 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--dash-ink-soft)]">
                Cost per seat
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight text-[var(--dash-ink)]">
                ₹{service.price}
                <span className="ml-1 text-sm font-normal text-[var(--dash-ink-soft)]">
                  /mo
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--dash-ink-soft)]">
                Total for {service.planMonths} month
                {service.planMonths > 1 ? "s" : ""}: ₹
                {service.price * service.planMonths}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-3 pt-6">
              <button
                type="button"
                onClick={() => onViewFull(service)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--dash-ink)] px-5 py-3.5 text-sm font-bold text-[var(--dash-canvas)] transition hover:opacity-90"
              >
                View Full Details
                <ArrowUpRight size={15} />
              </button>
              {service.private && (
                <button
                  type="button"
                  onClick={() => onShare(service)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--dash-border)] px-5 py-3.5 text-sm font-bold text-[var(--dash-ink)] transition hover:bg-[var(--dash-surface-strong)]"
                >
                  Share Invite Link
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
