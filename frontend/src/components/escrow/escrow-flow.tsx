"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { MarketplacePool } from "@/components/marketplace-view";
import { poolsApi, type PoolCredentials } from "@/lib/api";
import { toEscrowPool, type EscrowPool } from "./types";

type Stage = "pay" | "paying" | "confirming" | "done" | "dashboard";
type Timer = ReturnType<typeof setTimeout>;

const HANDLES = ["@okaxis", "@oksbi", "@ybl", "@paytm", "@upi"];
const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

/* ---------- shared class strings ---------- */
const MONO = "font-[family-name:var(--font-space-mono)]";
const CARD =
  "flex flex-col rounded-[32px] border-[2.5px] border-[#151515] p-[clamp(18px,3vw,28px)] shadow-[4px_4px_0_0_#151515]";
const BTN =
  "escrow-press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-[#151515]";
const BTN_BIG =
  "escrow-press inline-flex min-h-[60px] items-center justify-center gap-2.5 rounded-full border-[2.5px] border-[#151515] font-extrabold";
const BTN_DARK = `${BTN_BIG} bg-[#151515] px-6 text-[18px] text-[#fbf6ee] shadow-[4px_4px_0_0_#f28fe0]`;
const BTN_LIGHT = `${BTN_BIG} bg-white px-5 text-[16px] shadow-[3px_3px_0_0_#151515]`;
const PILL =
  "inline-flex items-center gap-1.5 rounded-full border-2 border-[#151515] px-3 py-1 text-xs font-extrabold";
const LABEL = "text-xs font-extrabold uppercase tracking-[0.06em] text-[#4a463d]";

/* ---------- icons ---------- */
const ICONS: Record<string, ReactNode> = {
  back: (
    <>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </>
  ),
  replay: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2L21 2" />
      <path d="M18 5l3 3" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.9 17.9A10.6 10.6 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5-5.9" />
      <path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2" />
      <path d="M1 1l22 22" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  shieldCheck: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  out: (
    <>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  next: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </>
  ),
  flag: (
    <>
      <path d="M4 22V4" />
      <path d="M4 4h13l-2 4 2 4H4" />
    </>
  ),
};

function Icon({
  name,
  size = 16,
  sw = 2.4,
  color = "#151515",
  className,
}: {
  name: string;
  size?: number;
  sw?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

function Spinner({ size, color, w }: { size: number; color: string; w: number }) {
  return (
    <svg className="escrow-spin" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="19" stroke={color} strokeOpacity="0.25" strokeWidth={w} />
      <path d="M24 5a19 19 0 0 1 19 19" stroke={color} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

function Logo({ className, letter }: { className: string; letter: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-[2.5px] border-[#151515] bg-white font-extrabold text-[#c4231b] ${className}`}
    >
      {letter}
    </span>
  );
}

function LiveBadge({ bg }: { bg: string }) {
  return (
    <span className={`${PILL} ${bg}`}>
      <span className="relative inline-block h-2.5 w-2.5">
        <span className="escrow-ping absolute inset-0 rounded-full bg-[#1f9d3a] opacity-60" />
        <span className="absolute inset-0 rounded-full bg-[#1f9d3a]" />
      </span>
      Access live
    </span>
  );
}

function PoolHeader({
  title,
  sub,
  badgeBg,
  letter,
}: {
  title: string;
  sub: string;
  badgeBg: string;
  letter: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <Logo className="h-14 w-14 text-[26px]" letter={letter} />
      <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
        <h2 className="text-2xl font-extrabold leading-[1.1] tracking-[-0.03em]">{title}</h2>
        <p className="text-sm font-semibold text-[#2b2a25]">{sub}</p>
      </div>
      <LiveBadge bg={badgeBg} />
    </div>
  );
}

function OpenButton({ onClick, className }: { onClick: () => void; className: string }) {
  return (
    <button type="button" onClick={onClick} className={`${BTN_DARK} ${className}`}>
      Open App &amp; Log In
      <Icon name="out" size={22} sw={2.6} color="#fbf6ee" />
    </button>
  );
}

function CopyBtn({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${BTN} min-w-[96px] bg-[#f7c85a] px-3.5 text-[13px] font-extrabold shadow-[2px_2px_0_0_#151515]`}
    >
      <Icon name="copy" />
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function useCopy() {
  const [copied, setCopied] = useState("");
  const t = useRef<Timer | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    clearTimeout(t.current);
    t.current = setTimeout(() => setCopied(""), 1800);
  };
  return { copied, copy };
}

type StepState = "active" | "todo" | "done";

function Step({
  state,
  icon,
  title,
  tag,
  desc,
  connector,
  delay,
}: {
  state: StepState;
  icon: string;
  title: string;
  tag?: string;
  desc: string;
  connector?: "solid" | "dashed";
  delay?: string;
}) {
  const circle =
    state === "done"
      ? "escrow-pop border-solid border-[#151515] bg-[#8de89a]"
      : state === "active"
        ? "border-dashed border-[#151515] bg-[#fbf6ee]"
        : "border-dashed border-[#151515]/45 bg-[#fbf6ee]";
  return (
    <li
      aria-current={state === "active" ? "step" : undefined}
      className="relative flex flex-col items-center gap-2.5 px-1 text-center"
    >
      {connector && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[26px] h-1 w-full rounded"
          style={{
            background:
              connector === "solid"
                ? "#151515"
                : "repeating-linear-gradient(90deg, rgba(21,21,21,0.25) 0 8px, transparent 8px 14px)",
          }}
        />
      )}
      <span
        className={`relative grid h-14 w-14 place-items-center rounded-full border-[2.5px] ${circle}`}
        style={delay ? { animationDelay: delay } : undefined}
      >
        {state === "active" && (
          <svg
            className="escrow-spin absolute -inset-[2.5px]"
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="28"
              cy="28"
              r="25"
              stroke="#f7c85a"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="30 130"
            />
          </svg>
        )}
        <Icon
          name={icon}
          size={state === "done" ? 26 : 24}
          sw={state === "done" ? 3.2 : 2.4}
          color={state === "todo" ? "#6b6558" : "#151515"}
          className="relative"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className={`text-[15px] font-extrabold leading-tight ${state === "todo" ? "text-[#4a463d]" : ""}`}>
          {title}
        </span>
        {tag && (
          <span className={`${MONO} text-xs font-bold uppercase tracking-[0.06em]`}>{tag}</span>
        )}
        <span
          className={`text-[13px] font-medium leading-snug ${state === "todo" ? "text-[#5c574b]" : "text-[#3d3a32]"}`}
        >
          {desc}
        </span>
        <span className="sr-only">
          {state === "done" ? "Completed" : state === "active" ? "In progress" : "Upcoming"}
        </span>
      </span>
    </li>
  );
}

function Progress({ paid }: { paid: boolean }) {
  return (
    <section aria-label="Escrow progress" className={`escrow-rise gap-6 bg-white ${CARD}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold tracking-[-0.02em]">Escrow progress</h2>
        <span
          className={`${MONO} rounded-full border-2 border-[#151515] px-2.5 py-0.5 text-xs font-bold ${paid ? "bg-[#8de89a]" : "bg-[#f7c85a]"}`}
        >
          {paid ? "2 of 2 done" : "Waiting for payment"}
        </span>
      </div>
      <ol className="grid grid-cols-2">
        <Step
          state={paid ? "done" : "active"}
          icon={paid ? "check" : "lock"}
          title="Payment Secured"
          tag={paid ? "Escrow active" : undefined}
          connector={paid ? "solid" : "dashed"}
          desc="Your contribution is held safely via Razorpay partner nodes."
        />
        <Step
          state={paid ? "done" : "todo"}
          icon={paid ? "check" : "key"}
          title="Access Unlocked"
          tag={paid ? "Credentials issued" : undefined}
          delay=".15s"
          desc={
            paid
              ? "Your login profile credentials have been instantly allocated."
              : "Your login credentials appear here the moment payment clears."
          }
        />
      </ol>
    </section>
  );
}

function PayForm({
  pool,
  upi,
  onUpi,
  invalid,
  paying,
  onSubmit,
}: {
  pool: EscrowPool;
  upi: string;
  onUpi: (v: string) => void;
  invalid: boolean;
  paying: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      aria-label="Pay with UPI via Razorpay"
      className={`escrow-rise gap-[22px] bg-[#f7c85a] ${CARD}`}
      style={{ animationDelay: ".1s" }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-[-0.03em]">Pay with UPI</h2>
        <p className="text-sm font-medium text-[#2b2a25]">
          Pay through Razorpay. Your <strong className={MONO}>{pool.amount}</strong> is locked in
          escrow and your login unlocks instantly.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <label htmlFor="upi-id" className="text-sm font-extrabold">
          Your UPI ID
        </label>
        <input
          id="upi-id"
          name="upi"
          type="text"
          inputMode="email"
          autoComplete="off"
          spellCheck={false}
          placeholder="yourname@okaxis"
          value={upi}
          onChange={(e) => onUpi(e.target.value)}
          aria-invalid={invalid}
          aria-describedby="upi-help"
          className={`${MONO} h-14 w-full rounded-full border-[2.5px] border-[#151515] bg-white px-[22px] text-base font-bold text-[#151515] shadow-[3px_3px_0_0_#151515] outline-offset-[3px]`}
        />
        <p
          id="upi-help"
          role={invalid ? "alert" : "note"}
          className={`text-[13px] font-bold ${invalid ? "text-[#b42318]" : "text-[#2b2a25]"}`}
        >
          {invalid
            ? "Enter a valid UPI ID, like name@okaxis."
            : "Tap a handle to finish your ID faster."}
        </p>
        <div className="flex flex-wrap gap-2">
          {HANDLES.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onUpi(upi.split("@")[0] + h)}
              className={`${BTN} ${MONO} bg-white px-4 text-[13px] font-bold`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button type="submit" disabled={paying} className={`${BTN_DARK} w-full disabled:cursor-wait`}>
          {paying ? (
            <>
              <Spinner size={22} color="#fbf6ee" w={6} />
              Approve the request in your UPI app
            </>
          ) : (
            <>
              <Icon name="lock" size={22} color="#fbf6ee" />
              Pay {pool.amount} securely
            </>
          )}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-[#2b2a25]">
          <Icon name="shield" className="shrink-0" />
          Powered by Razorpay. The host is paid only after the 7-day protection window.
        </p>
      </div>
    </form>
  );
}

function Row({
  label,
  value,
  last,
  children,
}: {
  label: string;
  value: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 py-3 ${last ? "" : "border-b-2 border-dashed border-[#151515]/25"}`}
    >
      <span className={`${LABEL} basis-24 flex-none`}>{label}</span>
      <span className={`${MONO} min-w-0 flex-[1_1_150px] text-[15px] font-bold [overflow-wrap:anywhere]`}>
        {value}
      </span>
      {children}
    </div>
  );
}

function Credentials({ pool, onDash }: { pool: EscrowPool; onDash: () => void }) {
  const { copied, copy } = useCopy();
  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);
  const letter = pool.name.charAt(0).toUpperCase();
  return (
    <section
      aria-label="Your access credentials"
      className={`escrow-rise gap-5 bg-[#8de89a] ${CARD}`}
      style={{ animationDelay: ".12s" }}
    >
      <PoolHeader
        title={`Your ${pool.name} access`}
        sub={`${pool.name} · ${pool.seat}`}
        badgeBg="bg-white"
        letter={letter}
      />
      <div className="flex flex-col rounded-[20px] border-2 border-[#151515] bg-white px-4 py-1.5 shadow-[3px_3px_0_0_#151515]">
        <Row label="Username" value={pool.username}>
          <CopyBtn done={copied === "user"} onClick={() => copy("user", pool.username)} />
        </Row>
        <Row label="Password" value={show ? pool.password : "•".repeat(12)}>
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
            className={`${BTN} w-11 bg-white shadow-[2px_2px_0_0_#151515]`}
          >
            <Icon name={show ? "eyeOff" : "eye"} size={18} />
          </button>
          <CopyBtn done={copied === "pass"} onClick={() => copy("pass", pool.password)} />
        </Row>
        <Row label="Profile" value={`Seat ${pool.seatNo} · PIN ${pool.pin}`} last>
          <CopyBtn done={copied === "pin"} onClick={() => copy("pin", pool.pin)} />
        </Row>
      </div>
      <div className="flex flex-wrap gap-3">
        <OpenButton onClick={() => setOpened(true)} className="flex-[2_1_260px]" />
        <button type="button" onClick={onDash} className={`${BTN_LIGHT} flex-[1_1_180px]`}>
          Go to dashboard <Icon name="next" size={18} sw={2.6} />
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-sm font-bold">
        {opened ? "Opening app with your credentials... (prototype: no real link)" : ""}
      </p>
    </section>
  );
}

function PoolDashboard({ pool, onCreds }: { pool: EscrowPool; onCreds: () => void }) {
  const [opened, setOpened] = useState(false);
  const [reported, setReported] = useState(false);
  const letter = pool.name.charAt(0).toUpperCase();
  const stats: [string, string][] = [
    ["Your split", pool.split],
    ["Escrow", "Active"],
    ["Host payout", "In 7 days"],
  ];
  return (
    <div className="flex flex-col gap-6">
      <section aria-label={`${pool.name} pool`} className={`escrow-rise gap-5 bg-white ${CARD}`}>
        <PoolHeader
          title={pool.name}
          sub={`${pool.seat} · Hosted by ${pool.host}`}
          badgeBg="bg-[#8de89a]"
          letter={letter}
        />
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {stats.map(([k, v]) => (
            <div
              key={k}
              className="flex flex-col gap-1 rounded-[18px] border-2 border-[#151515] bg-[#fbf6ee] px-3.5 py-3"
            >
              <dt className={LABEL}>{k}</dt>
              <dd className={`${MONO} text-base font-bold`}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-3">
          <OpenButton
            onClick={() => {
              setOpened(true);
              setReported(false);
            }}
            className="flex-[2_1_260px]"
          />
          <button type="button" onClick={onCreds} className={`${BTN_LIGHT} flex-[1_1_180px]`}>
            <Icon name="key" size={18} />
            View credentials
          </button>
        </div>
        {opened && (
          <p role="status" aria-live="polite" className="text-sm font-bold">
            Opening app with your credentials... (prototype: no real link)
          </p>
        )}
      </section>

      <section
        aria-label="Escrow protection"
        className={`escrow-rise gap-5 bg-[#f7c85a] ${CARD}`}
        style={{ animationDelay: ".12s" }}
      >
        <div className="flex items-start gap-3.5">
          <Icon name="shieldCheck" size={28} className="mt-px shrink-0" />
          <p className="text-base font-semibold leading-normal">
            <strong className="font-extrabold">Protected:</strong> Payout transfers to the host in
            7 days. If your access stops working before then, click “Report Issue” below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setReported(true);
            setOpened(false);
          }}
          className={`${BTN_LIGHT} w-full`}
        >
          <Icon name="flag" size={18} />
          Report Issue
        </button>
        {reported && (
          <p role="status" aria-live="polite" className="text-sm font-bold">
            Report sent. The host and Splitza support have been notified.
          </p>
        )}
      </section>
    </div>
  );
}

function Summary({ pool, paid }: { pool: EscrowPool; paid: boolean }) {
  const letter = pool.name.charAt(0).toUpperCase();
  const rows: [string, string][] = [
    ["Total plan value", pool.total],
    ["Members splitting", `${pool.members} people`],
    ["Your split", pool.split],
    ...(paid
      ? ([
          ["Paid via", "Razorpay UPI"],
          ["Reference", pool.reference],
        ] as [string, string][])
      : []),
  ];
  return (
    <aside
      aria-label="Payment summary"
      className="escrow-rise flex max-w-full flex-[1_1_320px] flex-col overflow-hidden rounded-[32px] border-[2.5px] border-[#151515] bg-white shadow-[4px_4px_0_0_#151515]"
      style={{ animationDelay: ".2s" }}
    >
      <div className="flex items-center gap-3 border-b-[2.5px] border-[#151515] bg-[#f7c85a] p-5">
        <Logo className="h-[52px] w-[52px] text-2xl" letter={letter} />
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-extrabold uppercase tracking-[0.05em] text-[#3d3a32]">
            {paid ? "You joined" : "You are joining"}
          </span>
          <h2 className="text-xl font-extrabold leading-[1.15] tracking-[-0.02em]">{pool.name}</h2>
          <span className="text-sm font-semibold">Hosted by {pool.host}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <h3 className="text-base font-extrabold">Payment summary</h3>
        <dl className="flex flex-col gap-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="font-medium text-[#3d3a32]">{k}</dt>
              <dd className={`${MONO} font-bold`}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t-2 border-dashed border-[#151515]/30" />
        <div className="flex items-end justify-between gap-3">
          <span className="font-extrabold">{paid ? "Held in escrow" : "Due today"}</span>
          <span className={`${MONO} text-[30px] font-bold leading-none`}>{pool.amount}</span>
        </div>
        <div className="flex items-start gap-2.5 rounded-2xl border-2 border-[#151515] bg-[#8de89a] p-3 text-[13px] font-bold leading-snug">
          <Icon name="lock" size={18} className="mt-px shrink-0" />
          The host is paid only after the 7-day protection window ends.
        </div>
      </div>
    </aside>
  );
}

interface EscrowFlowProps {
  pool: MarketplacePool | null;
  onClose: () => void;
}

export function EscrowFlow({ pool, onClose }: EscrowFlowProps) {
  const [stage, setStage] = useState<Stage>("pay");
  const [upi, setUpi] = useState("");
  const [touched, setTouched] = useState(false);
  const timers = useRef<Timer[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (!pool) {
      clearTimers();
      setStage("pay");
      setUpi("");
      setTouched(false);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      clearTimers();
    };
  }, [pool, onClose]);

  if (!pool) return null;

  const escrowPool = toEscrowPool(pool);
  const invalid = touched && !UPI_RE.test(upi.trim());
  const paid = stage === "done" || stage === "dashboard";

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!UPI_RE.test(upi.trim())) {
      setTouched(true);
      return;
    }
    if (stage !== "pay") return;
    setStage("paying");
    timers.current = [
      setTimeout(() => setStage("confirming"), 1800),
      setTimeout(() => setStage("done"), 3000),
    ];
  }

  function replay() {
    clearTimers();
    setStage("pay");
    setTouched(false);
  }

  const eyebrow =
    stage === "dashboard"
      ? "My dashboard · Pools"
      : stage === "done"
        ? "Order confirmed"
        : `You are joining ${escrowPool.name}`;
  const title =
    stage === "dashboard"
      ? escrowPool.name
      : stage === "done"
        ? "Your seat is ready"
        : "Secure escrow";

  return (
    <div className="escrow-dots fixed inset-0 z-[100] overflow-y-auto bg-[#fbf6ee] px-[clamp(16px,4vw,56px)] pb-16 pt-8 text-[#151515]">
      <main className="mx-auto flex max-w-[1120px] flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#151515] bg-[#f7c85a] text-xl font-extrabold shadow-[3px_3px_0_0_#151515]">
              S
            </span>
            <span className="text-2xl font-extrabold tracking-[-0.02em]">Splitza</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`${BTN} bg-white px-[18px] text-sm font-bold shadow-[3px_3px_0_0_#151515]`}
            >
              <Icon name="back" sw={2.5} />
              Back to marketplace
            </button>
            <button
              type="button"
              onClick={replay}
              className={`${BTN} bg-[#c9a8e8] px-[18px] text-sm font-bold shadow-[3px_3px_0_0_#151515]`}
            >
              <Icon name="replay" sw={2.5} />
              Restart demo
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-1.5">
          <p className="text-base font-medium text-[#4a463d]">{eyebrow}</p>
          <h1 className="text-[clamp(36px,6vw,56px)] font-extrabold leading-none tracking-[-0.04em]">
            {title}
          </h1>
        </div>

        {stage === "confirming" ? (
          <section
            role="status"
            aria-live="polite"
            className={`items-center gap-4 bg-[#f7c85a] px-6 py-12 text-center ${CARD}`}
          >
            <Spinner size={48} color="#151515" w={5} />
            <h2 className="text-2xl font-extrabold tracking-[-0.02em]">
              Confirming your Razorpay payment
            </h2>
            <p className="text-[15px] font-medium text-[#3d3a32]">
              This takes a moment. Do not close this page.
            </p>
          </section>
        ) : (
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
              {(stage === "pay" || stage === "paying") && (
                <>
                  <Progress paid={false} />
                  <PayForm
                    pool={escrowPool}
                    upi={upi}
                    onUpi={setUpi}
                    invalid={invalid}
                    paying={stage === "paying"}
                    onSubmit={submit}
                  />
                </>
              )}
              {stage === "done" && (
                <>
                  <Progress paid />
                  <Credentials pool={escrowPool} onDash={() => setStage("dashboard")} />
                </>
              )}
              {stage === "dashboard" && (
                <PoolDashboard pool={escrowPool} onCreds={() => setStage("done")} />
              )}
            </div>
            <Summary pool={escrowPool} paid={paid} />
          </div>
        )}
      </main>

      <style>{`
        .escrow-dots {
          background-image: radial-gradient(
            color-mix(in oklab, #151515 12%, transparent) 1.2px,
            transparent 1.2px
          );
          background-size: 22px 22px;
        }
        @keyframes escrow-spin {
          to { transform: rotate(360deg); }
        }
        .escrow-spin { animation: escrow-spin 0.9s linear infinite; }
        @keyframes escrow-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .escrow-ping { animation: escrow-ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes escrow-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .escrow-rise { animation: escrow-rise 0.4s ease both; }
        @keyframes escrow-pop {
          0% { transform: scale(0.85); }
          60% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .escrow-pop { animation: escrow-pop 0.35s ease both; }
        .escrow-press:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
