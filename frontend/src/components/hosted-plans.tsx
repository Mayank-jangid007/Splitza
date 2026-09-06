"use client";

import {
  Check,
  Lock,
  Minus,
  RefreshCcw,
  Send,
  Share2,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";

export type Service = {
  name: string;
  host: string;
  price: number;
  capacity: number;
  filled: number;
  private: boolean;
  brand?: string;
  logoUrl?: string;
  accent: string;
  planMonths: number;
};

export const defaultServices: Service[] = [
  {
    name: "Netflix Premium 4K",
    host: "Arjun Mehta",
    price: 162,
    capacity: 4,
    filled: 3,
    private: true,
    brand: "N",
    logoUrl: "https://cdn.simpleicons.org/netflix/E50914",
    accent: "bg-red-600",
    planMonths: 1,
  },
  {
    name: "Spotify Family",
    host: "Maya Kapoor",
    price: 48,
    capacity: 6,
    filled: 5,
    private: false,
    brand: "S",
    logoUrl: "https://cdn.simpleicons.org/spotify/1ED760",
    accent: "bg-emerald-400",
    planMonths: 3,
  },
];

export function ServiceCard({
  service,
  dark,
  onOpen,
}: {
  service: Service;
  dark: boolean;
  onOpen: (service: Service) => void;
}) {
  const available = service.capacity - service.filled;
  const fillRate = Math.round((service.filled / service.capacity) * 100);
  const status =
    available === 0
      ? "FULLY SPLIT"
      : fillRate >= 60
      ? "ACTIVE SPLIT"
      : "OPEN FOR MATCHES";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(service)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(service);
        }
      }}
      className={[
        "group relative flex min-w-[260px] snap-start cursor-pointer flex-col overflow-hidden rounded-none border-2 p-2.5 transition duration-300 hover:-translate-y-1 sm:min-w-[280px]",
        dark
          ? "border-zinc-500 bg-[#17171A] text-[#F5F3EC] shadow-[5px_5px_0_#000] hover:border-[#C6FF5C] hover:shadow-[6px_6px_0_#C6FF5C]"
          : "border-zinc-900 bg-white text-zinc-950 shadow-[5px_5px_0_#000] hover:border-zinc-950 hover:shadow-[6px_6px_0_#000]",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-none border-2 border-zinc-700 bg-white text-xl font-black text-black shadow-[2px_2px_0_#27272a]">
            {service.logoUrl ? (
              <img
                src={service.logoUrl}
                alt={`${service.name} logo`}
                className="size-7 object-contain"
              />
            ) : (
              service.brand ?? service.name.charAt(0)
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-mono text-sm font-black uppercase tracking-[-0.04em]">
              {service.name}
            </h3>
            <p className={dark ? "mt-1 truncate text-xs text-slate-400" : "mt-1 truncate text-xs text-slate-500"}>
              Hosted by {service.host}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-1 rounded-none border px-2 py-1 font-mono text-[8px] font-black",
              service.private
                ? "border-amber-300/60 text-amber-300"
                : "border-emerald-300/60 text-emerald-300",
            ].join(" ")}
          >
            {service.private ? <Lock size={10} /> : <Check size={10} />}
            {service.private ? "PRIVATE" : "PUBLIC MATCH"}
          </span>
        </div>
      </div>

      {/* Seat fill bar */}
      <div
        className={[
          "mt-3 rounded-none border px-3 py-2",
          dark ? "border-zinc-700 bg-[#0E0E10]" : "border-zinc-200 bg-zinc-50",
        ].join(" ")}
        aria-label={`${service.filled} of ${service.capacity} seats filled, ${available} open`}
      >
        <div className="flex items-center justify-between font-mono text-[10px] font-black">
          <span className="text-emerald-300">{service.filled} filled</span>
          <span className="text-slate-400">{available} open</span>
        </div>
        <div className="mt-2 flex h-2 gap-1" aria-hidden="true">
          {Array.from({ length: service.capacity }, (_, index) => (
            <span
              key={index}
              className={[
                "flex-1 rounded-none",
                index < service.filled
                  ? "bg-emerald-300"
                  : dark
                  ? "bg-zinc-800"
                  : "bg-zinc-200",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      {/* Price & status */}
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-zinc-800 pt-3">
        <div>
          <p className="font-mono text-[9px] font-black tracking-widest text-zinc-500">
            FAIR SPLIT / SEAT
          </p>
          <p className="mt-1 font-mono text-3xl font-black tracking-[-0.08em]">
            ₹{service.price}
            <span className="ml-1 text-xs font-bold tracking-normal text-zinc-500">/mo</span>
          </p>
        </div>
        <span className="rounded-md border border-emerald-300/50 bg-transparent px-2 py-1 font-mono text-[8px] font-black text-[#C6FF5C]">
          {status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 overflow-hidden rounded-sm border border-zinc-800 bg-zinc-950">
        <div
          className="h-full bg-emerald-300 transition-all"
          style={{ width: `${fillRate}%` }}
        />
      </div>
    </article>
  );
}

export function HostPlanDetails({
  service,
  dark,
  onBack,
  onShare,
}: {
  service: Service;
  dark: boolean;
  onBack: () => void;
  onShare: (service: Service) => void;
}) {
  const openSeats = service.capacity - service.filled;
  const hostTotalShare = service.price * service.planMonths;
  const totalRecoveredFromMembers =
    service.price * Math.max(service.filled - 1, 0) * service.planMonths;
  const totalPlanDays = service.planMonths * 30;
  const daysLeft = Math.max(0, totalPlanDays - 12);
  const endDate = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000));
  const isRenewal = service.planMonths > 1;

  return (
    <main
      className={[
        "min-h-screen px-4 pb-12 pt-6 font-sans",
        dark ? "bg-[#050505] text-zinc-50" : "bg-slate-100 text-zinc-950",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[980px] flex-col items-center">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 self-start font-mono text-xs font-black uppercase tracking-widest text-emerald-300 hover:text-white"
        >
          ← Back to plans
        </button>

        <div className="relative w-full max-w-2xl pt-5">
          {/* Badge */}
          <div className="absolute -left-2 top-0 z-10 border-2 border-[#F5F3EC] bg-[#C6FF5C] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#0E0E10]">
            Hosted Plan
          </div>

          <section className="border-[3px] border-[#F5F3EC] bg-[#151517] border-r-8 border-b-8 border-[#5CE1E6]">
            {/* Header */}
            <div className="flex items-center gap-4 p-7 pt-9">
              <div
                className="grid size-16 shrink-0 place-items-center border-2 border-[#F5F3EC] bg-white"
                style={{ transform: "rotate(-3deg)" }}
              >
                {service.logoUrl ? (
                  <img
                    src={service.logoUrl}
                    alt={`${service.name} logo`}
                    className="size-10 object-contain"
                  />
                ) : (
                  <span className="text-2xl font-black text-black">
                    {service.brand ?? service.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold uppercase leading-none tracking-tight text-[#F5F3EC]">
                  {service.name}
                </h1>
                <div className="mt-2 inline-block bg-[#F5F3EC] px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#0E0E10]">
                  {service.host} · {service.planMonths} month term
                </div>
              </div>
            </div>

            <div className="mx-7 border-t-2 border-dashed border-[#3A3A3E]" />

            {/* Members */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-7">
              <div>
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#7A7873]">
                  Members Joined
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: service.filled }, (_, index) => (
                    <div
                      key={index}
                      className="grid size-9 place-items-center border-2 border-[#F5F3EC] text-[10px] font-extrabold text-[#0E0E10]"
                      style={{
                        background: ["#C6FF5C", "#5CE1E6", "#B98CFF", "#FF6B57", "#FFC93C"][index % 5],
                        transform: `rotate(${[-4, 3, -2, 4, -3][index % 5]}deg)`,
                      }}
                    >
                      {index === 0
                        ? service.host.split(" ").map((part) => part[0]).join("")
                        : `M${index}`}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-[#A8A6A0]">
                  {service.filled} of {service.capacity} seats active · {openSeats} still open
                </div>
              </div>
              <div className="flex size-20 shrink-0 rotate-[5deg] flex-col items-center justify-center border-[3px] border-[#F5F3EC] bg-[#0E0E10] shadow-[5px_5px_0_#5CE1E6]">
                <span className="text-2xl font-extrabold leading-none text-[#5CE1E6]">
                  {service.filled}/{service.capacity}
                </span>
                <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#A8A6A0]">
                  Seats
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="px-7 pb-7">
              <p className="mb-3 text-sm text-[#D8D6CF]">
                Auto-closes{" "}
                <span className="font-bold text-[#F5F3EC]">{endDate}</span>. No
                automatic renewals.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {Array.from({ length: 12 }, (_, index) => (
                    <div
                      key={index}
                      className="h-4 flex-1 border border-[#F5F3EC]"
                      style={{
                        background:
                          index <
                          Math.round(
                            ((totalPlanDays - daysLeft) / totalPlanDays) * 12
                          )
                            ? "#5CE1E6"
                            : "transparent",
                      }}
                    />
                  ))}
                </div>
                <span className="shrink-0 font-mono text-[10px] font-bold text-[#A8A6A0]">
                  {totalPlanDays - daysLeft}/{totalPlanDays}D
                </span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="flex flex-col gap-5 px-7 pb-6 sm:flex-row">
              <div className="flex-1 rotate-[-1deg] border-2 border-[#F5F3EC] bg-[#1F1F23] p-5">
                <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A8A6A0]">
                  <span className="grid size-4 place-items-center border border-[#F5F3EC]">
                    <Minus size={10} strokeWidth={3} />
                  </span>
                  Your Share
                </div>
                <div className="text-4xl font-extrabold tracking-tight text-[#F5F3EC]">
                  ₹{hostTotalShare}
                </div>
                <div className="mt-2 font-mono text-[10px] text-[#A8A6A0]">
                  Your fixed portion
                </div>
              </div>
              <div className="flex-1 rotate-[1deg] border-2 border-[#F5F3EC] bg-[#1F1F23] p-5">
                <div className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A8A6A0]">
                  <span className="grid size-4 place-items-center border border-[#F5F3EC]">
                    <ShieldCheck size={10} strokeWidth={3} className="text-[#F5F3EC]" />
                  </span>
                  Pool Funding
                </div>
                <div className="text-4xl font-extrabold tracking-tight text-[#F5F3EC]">
                  ₹{totalRecoveredFromMembers}
                </div>
                <div className="mt-2 font-mono text-[10px] text-[#A8A6A0]">
                  Recovered from {Math.max(service.filled - 1, 0)} seats
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between gap-2 border-t border-[#2A2A2E] px-7 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Lock size={12} className="shrink-0 text-[#FFC93C]" />
                <span className="truncate text-[11px] text-[#A8A6A0]">
                  Total amount for this plan:{" "}
                  <span className="font-bold text-[#F5F3EC]">
                    ₹{hostTotalShare + totalRecoveredFromMembers}
                  </span>
                </span>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-bold text-[#FFC93C]">
                PAYMENT SECURED
              </span>
            </div>

            <div className="mx-7 border-t-2 border-dashed border-[#3A3A3E]" />

            {/* Action buttons */}
            <div className="flex flex-wrap items-stretch gap-4 p-7">
              {service.private && (
                <div className="flex border-2 border-[#F5F3EC]">
                  <button
                    type="button"
                    onClick={() => onShare(service)}
                    className="flex items-center gap-2 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-[#F5F3EC] hover:bg-[#F5F3EC] hover:text-[#0E0E10]"
                  >
                    <UserPlus size={13} /> Invites
                  </button>
                </div>
              )}
              <div className="ml-auto flex gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 border-2 border-[#0E0E10] bg-[#FFC93C] px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-[#0E0E10]"
                >
                  <RefreshCcw size={13} /> {isRenewal ? "Renew" : "Re-Pool"}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 border-2 border-[#0E0E10] bg-[#FF6B57] px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-[#0E0E10]"
                >
                  <XCircle size={13} /> End Split
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
