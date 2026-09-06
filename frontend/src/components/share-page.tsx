"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Link2,
  Lock,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react"

const catalog = [
  { name: "Netflix Premium 4K", price: 649, limit: 4, tier: "Premium", logoUrl: "https://cdn.simpleicons.org/netflix/E50914" },
  { name: "Spotify Family", price: 179, limit: 6, tier: "Family", logoUrl: "https://cdn.simpleicons.org/spotify/1ED760" },
  { name: "YouTube Premium", price: 189, limit: 5, tier: "Family", logoUrl: "https://cdn.simpleicons.org/youtube/FF0000" },
  { name: "Apple One", price: 365, limit: 5, tier: "Family", logoUrl: "https://cdn.simpleicons.org/apple/000000" },
  { name: "Canva Pro", price: 499, limit: 5, tier: "Teams", logoUrl: "https://cdn.simpleicons.org/canva/00C4CC" },
]

export type LaunchPlanDetails = {
  name: string;
  price: number;
  limit: number;
  isPrivate: boolean;
  tier?: string;
  logoUrl?: string;
};

export function SharePage({ dark, onBack, onLaunch }: { dark: boolean; onBack: () => void; onLaunch?: (details: LaunchPlanDetails) => void }) {
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<typeof catalog[number] | null>(null)
  const [custom, setCustom] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customLimit, setCustomLimit] = useState("2")
  const [billing, setBilling] = useState("Monthly")
  const [monthlyMonths, setMonthlyMonths] = useState("1")
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [inviteLink, setInviteLink] = useState("")
  const [upi, setUpi] = useState("")

  const results = catalog.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
  const suggestions = query ? results : catalog.slice(0, 3)
  const name = custom ? customName : selected?.name ?? ""
  const price = custom ? Number(customPrice) || 0 : selected?.price ?? 0
  const limit = custom ? Number(customLimit) || 1 : selected?.limit ?? 1

  const headings = ["SELECT SUBSCRIPTION", "TIER & COST", "VISIBILITY", "CREDENTIALS", "PAYOUT", "REVIEW SUMMARY"]

  if (step === 2 && custom)
    return (
      <CustomParameters
        dark={dark}
        name={customName}
        price={customPrice}
        limit={customLimit}
        billing={billing}
        monthlyMonths={monthlyMonths}
        onMonthlyMonths={setMonthlyMonths}
        onName={setCustomName}
        onPrice={setCustomPrice}
        onLimit={setCustomLimit}
        onBilling={setBilling}
        onBack={() => setStep(1)}
        onNext={() => setStep(3)}
      />
    )

  const goOfficial = (item: typeof catalog[number]) => {
    setSelected(item)
    setCustom(false)
    setStep(2)
  }
  const goCustom = () => {
    setCustom(true)
    setSelected(null)
    setStep(2)
  }

  const sectionClass =
    step === 1
      ? "mx-auto w-full max-w-3xl text-center"
      : "relative z-10 ml-auto w-full max-w-2xl rounded-2xl border-[3px] border-black bg-slate-950 p-6 text-slate-100 shadow-[8px_8px_0_#34d399] lg:mr-6 lg:p-8"

  const hasCredentials = (username.trim() && password.trim()) || inviteLink.trim()
  const nextDisabled =
    (step === 4 && !hasCredentials) || (step === 5 && !upi.includes("@"))

  return (
    <main className={`min-h-screen px-4 pb-12 font-sans ${dark ? "bg-[#020617] text-slate-50" : "bg-slate-100 text-slate-950"}`}>
      <div className="mx-auto max-w-[1220px] pt-5">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-700 px-3 py-2 font-mono text-[10px] font-black hover:bg-slate-800 hover:text-white transition-colors">
          <ArrowLeft size={15} /> BACK TO DASHBOARD
        </button>
        <div className={`mt-12 grid gap-10 ${step === 1 ? "lg:grid-cols-1" : "lg:grid-cols-[250px_1fr]"}`}>
          <aside className={step === 1 ? "hidden" : "block"}>
            <p className="font-mono text-[10px] font-black tracking-[.18em] text-emerald-300">HOST ONBOARDING / 0048</p>
            <h1 className="mt-4 font-mono text-5xl font-black uppercase leading-[.85] tracking-[-.1em]">
              Share your<br />
              <span className="text-violet-300">subscription.</span>
            </h1>
            <div className="mt-10 flex flex-col gap-2">
              {headings.map((heading, index) => {
                const active = index + 1 === step
                const complete = index + 1 < step
                return (
                  <div key={heading} className={`flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 font-mono text-[10px] font-black transition-all duration-200 ${active ? "border-emerald-300 text-emerald-300" : complete ? "border-emerald-300/50 text-emerald-300" : "border-slate-700 text-slate-500"}`}>
                    <span className={`grid size-6 place-items-center rounded-full border-2 border-current text-[9px] ${complete ? "bg-emerald-300 text-slate-950 border-none" : ""}`}>
                      {complete ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{heading}</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 font-mono text-[10px] font-black text-slate-500">STEP {step} OF 6</p>
          </aside>

          <section className={sectionClass}>
            {step > 1 && <p className="font-mono text-[10px] font-black tracking-[.16em] text-slate-500">{headings[step - 1]}</p>}
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="mt-3">
                <h2 className="font-mono text-3xl font-black uppercase tracking-[-.08em]">
                  {step === 1
                    ? "Find your subscription"
                    : step === 2
                      ? `${selected?.name ?? "Subscription"} setup`
                      : step === 3
                        ? "Choose visibility"
                        : step === 4
                          ? "Add credentials"
                          : step === 5
                            ? "Payout details"
                            : "Review your split"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {step === 1
                    ? "Choose an official plan or create your own custom split."
                    : step === 2
                      ? "Confirm the plan tier and retail price."
                      : step === 3
                        ? "Decide who can discover and join this split."
                        : step === 4
                          ? "Your credentials are end-to-end encrypted and never shown to members."
                          : step === 5
                            ? "Weekly payouts are routed directly to your UPI ID."
                            : "Double-check everything before your split pool goes live."}
                </p>

                {step === 1 && (
                  <>
                    <label className="mt-8 flex items-center gap-3 rounded-xl border-[3px] border-black bg-slate-900 px-4 py-3 text-slate-100">
                      <Search size={17} />
                      <input aria-label="Search subscriptions" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search official subscriptions..." className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-slate-500" />
                    </label>
                    <div className="mx-auto mt-6 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-3">
                      {suggestions.map((item, index) => (
                        <motion.button
                          key={item.name}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                          onClick={() => goOfficial(item)}
                          className={`group relative flex min-h-[8.5rem] flex-col justify-between rounded-2xl border-[3px] border-black p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0_#34d399] bg-slate-900 text-slate-100 shadow-[5px_5px_0_#1e293b]`}
                        >
                          <div>
                            <span className="flex items-start justify-between w-full">
                              {item.logoUrl ? (
                                <span className="grid size-8 place-items-center rounded bg-white p-1 border-2 border-slate-700 shadow-[2px_2px_0_#000]">
                                  <img src={item.logoUrl} alt={item.name} className="size-full object-contain" />
                                </span>
                              ) : null}
                              <ArrowUpRight size={16} className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
                            </span>
                            <b className="mt-3 block font-mono text-sm leading-tight">{item.name}</b>
                          </div>
                          <small className="mt-2 block text-xs opacity-70">₹{item.price}/mo · up to {item.limit} members</small>
                        </motion.button>
                      ))}
                    </div>
                    <button onClick={goCustom} aria-label="Create a custom split plan" className="mx-auto mt-6 flex w-full max-w-xl items-center justify-between gap-4 rounded-2xl border-[3px] border-black bg-violet-300 p-5 text-left font-mono text-xs font-black text-slate-950 shadow-[6px_6px_0_#34d399] transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_#34d399] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#34d399]">
                      <span>
                        <span className="block text-[9px] tracking-[.14em]">NOT LISTED?</span>
                        <span className="mt-1 block text-sm">Create a Custom Split Plan</span>
                      </span>
                      <ArrowUpRight size={20} strokeWidth={3} />
                    </button>
                  </>
                )}

                {step === 2 && !custom && (
                  <div className="mt-8 rounded-xl border-[3px] border-black bg-emerald-300 p-6 text-slate-950">
                    <p className="font-mono text-xs font-black">OFFICIAL RETAIL PRICE</p>
                    <p className="mt-2 font-mono text-4xl font-black">₹{price}/month</p>
                    <p className="mt-2 text-sm font-bold">Maximum {limit} members for {selected?.tier}.</p>
                  </div>
                )}

                {step === 3 && (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => setVisibility("public")}
                      className={`flex flex-col gap-3 rounded-2xl border-[3px] p-5 text-left transition-all duration-200 ${visibility === "public" ? "border-emerald-300 bg-slate-900 shadow-[5px_5px_0_#34d399]" : "border-slate-700 bg-slate-900/60 hover:-translate-y-1"}`}
                    >
                      <span className="grid size-12 place-items-center rounded-xl border-[3px] border-black bg-emerald-300 text-slate-950">
                        <Globe2 size={22} />
                      </span>
                      <span className="font-mono text-sm font-black">PUBLIC</span>
                      <span className="text-xs text-slate-400">Discoverable by any verified member looking to join a split.</span>
                    </button>
                    <button
                      onClick={() => setVisibility("private")}
                      className={`flex flex-col gap-3 rounded-2xl border-[3px] p-5 text-left transition-all duration-200 ${visibility === "private" ? "border-violet-300 bg-slate-900 shadow-[5px_5px_0_#a78bfa]" : "border-slate-700 bg-slate-900/60 hover:-translate-y-1"}`}
                    >
                      <span className="grid size-12 place-items-center rounded-xl border-[3px] border-black bg-violet-300 text-slate-950">
                        <Users size={22} />
                      </span>
                      <span className="font-mono text-sm font-black">PRIVATE</span>
                      <span className="text-xs text-slate-400">Invite-only — just friends and people you share the link with.</span>
                    </button>
                  </div>
                )}

                {step === 4 && (
                  <div className="mt-8 grid gap-4">
                    <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-300/50 bg-slate-900 px-4 py-3 font-mono text-[10px] font-black text-emerald-300">
                      <ShieldCheck size={15} /> YOUR CREDENTIALS ARE END-TO-END ENCRYPTED
                    </div>
                    <label className="grid gap-2">
                      <span className="flex items-center gap-2 font-mono text-[10px] font-black tracking-[.14em] text-slate-400"><UserRound size={13} /> USERNAME</span>
                      <input value={username} onChange={event => setUsername(event.target.value)} placeholder="account@email.com" className="rounded-xl border-[3px] border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-300" />
                    </label>
                    <label className="grid gap-2">
                      <span className="flex items-center gap-2 font-mono text-[10px] font-black tracking-[.14em] text-slate-400"><Lock size={13} /> PASSWORD</span>
                      <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" className="rounded-xl border-[3px] border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-300" />
                    </label>
                    <div className="flex items-center gap-3 py-1" aria-hidden="true">
                      <span className="h-px flex-1 bg-slate-800" />
                      <span className="font-mono text-[9px] font-black tracking-[.16em] text-slate-500">OR USE INVITE LINK</span>
                      <span className="h-px flex-1 bg-slate-800" />
                    </div>
                    <label className="grid gap-2">
                      <span className="flex items-center gap-2 font-mono text-[10px] font-black tracking-[.14em] text-emerald-300"><Link2 size={13} /> FAMILY INVITE LINK</span>
                      <input type="url" value={inviteLink} onChange={event => setInviteLink(event.target.value)} placeholder="Paste your family invite link" className="rounded-xl border-[3px] border-slate-700 bg-slate-900 px-4 py-3 font-mono text-sm outline-none transition focus:border-emerald-300" />
                      <span className="text-xs leading-5 text-slate-500">Use this instead of username and password. Members will join through the invite.</span>
                    </label>
                  </div>
                )}

                {step === 5 && (
                  <div className="mt-8 grid gap-3">
                    <label className="grid gap-2">
                      <span className="flex items-center gap-2 font-mono text-[10px] font-black tracking-[.14em] text-slate-400"><Wallet size={13} /> UPI ID</span>
                      <input value={upi} onChange={event => setUpi(event.target.value)} placeholder="yourname@upi" className="rounded-xl border-[3px] border-slate-700 bg-slate-900 px-4 py-4 font-mono text-sm outline-none transition focus:border-emerald-300 text-white" />
                    </label>
                    <p className="font-mono text-[10px] text-slate-500">You&apos;ll receive ₹{Math.max(0, Math.round(price / Math.max(1, limit)))} per member each cycle.</p>
                  </div>
                )}

                {step === 6 && (
                  <div className="mt-8 grid gap-4">
                    <div className="rounded-2xl border-[3px] border-slate-700 bg-slate-900 p-6 text-slate-100">
                      <p className="font-mono text-[10px] font-black tracking-[.16em]">YOU&apos;RE ALL SET</p>
                      <p className="mt-2 font-mono text-2xl font-black uppercase tracking-[-.05em]">{name || "Custom split"}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border-2 border-slate-700 bg-slate-900 p-4">
                        <p className="font-mono text-[9px] font-black tracking-[.16em] text-slate-500">BRAND</p>
                        <p className="mt-1 font-mono text-sm font-black">{name || "—"}</p>
                      </div>
                      {!custom && (
                        <div className="rounded-xl border-2 border-slate-700 bg-slate-900 p-4">
                          <p className="font-mono text-[9px] font-black tracking-[.16em] text-slate-500">TIER</p>
                          <p className="mt-1 font-mono text-sm font-black">{selected?.tier}</p>
                        </div>
                      )}
                      <div className="rounded-xl border-2 border-violet-300/50 bg-slate-900 p-4">
                        <p className="flex items-center gap-2 font-mono text-[9px] font-black tracking-[.16em] text-violet-300"><Users size={12} /> SEATS</p>
                        <p className="mt-1 font-mono text-2xl font-black text-violet-300">{limit}</p>
                      </div>
                      <div className="rounded-xl border-2 border-emerald-300/50 bg-slate-900 p-4">
                        <p className="font-mono text-[9px] font-black tracking-[.16em] text-emerald-300">PRICE / PERSON</p>
                        <p className="mt-1 font-mono text-2xl font-black text-emerald-300">₹{Math.max(0, Math.round(price / Math.max(1, limit)))}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border-2 border-slate-700 bg-slate-900 px-4 py-3">
                      <span className="flex items-center gap-2 font-mono text-[10px] font-black tracking-[.14em] text-slate-400"><Wallet size={13} /> PAYOUT UPI</span>
                      <span className="font-mono text-sm font-black text-slate-100">{upi || "—"}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-between border-t-2 border-slate-700 pt-5">
              <button onClick={() => (step === 1 ? onBack() : setStep(step - 1))} className="rounded-lg border-2 border-slate-700 px-4 py-3 font-mono text-[10px] font-black hover:bg-slate-800 transition-colors">
                {step === 1 ? "CANCEL" : "BACK"}
              </button>
              <button
                disabled={nextDisabled}
                onClick={() => {
                  if (step < 6) {
                    setStep(step + 1)
                  } else {
                    onLaunch?.({
                      name: name || "Custom split",
                      price: Math.max(0, Math.round(price / Math.max(1, limit))),
                      limit: Number(limit) || 1,
                      isPrivate: visibility === "private",
                      tier: custom ? undefined : selected?.tier,
                      logoUrl: custom ? undefined : selected?.logoUrl,
                    })
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border-[3px] border-black bg-emerald-300 px-5 py-3 font-mono text-[10px] font-black text-slate-950 shadow-[4px_4px_0_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-40"
              >
                {step === 6 ? "LAUNCH ACTIVE SPLIT POOL 🎉" : "NEXT STEP"}
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

type CustomProps = {
  dark: boolean
  name: string
  price: string
  limit: string
  billing: string
  monthlyMonths: string
  onMonthlyMonths: (value: string) => void
  onName: (value: string) => void
  onPrice: (value: string) => void
  onLimit: (value: string) => void
  onBilling: (value: string) => void
  onBack: () => void
  onNext: () => void
}

function CustomParameters({ dark, name, price, limit, billing, monthlyMonths, onMonthlyMonths, onName, onPrice, onLimit, onBilling, onBack, onNext }: CustomProps) {
  const shell = dark ? "bg-[#07111f] text-slate-50" : "bg-slate-100 text-slate-950"
  const field = dark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-300 bg-white"
  return <section className={`min-h-screen px-4 py-8 font-sans ${shell}`}>
    <div className="mx-auto max-w-5xl">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-700 px-4 py-2 font-mono text-[10px] font-black transition hover:-translate-x-1"><ArrowLeft size={15} /> BACK TO SUBSCRIPTIONS</button>
      <div className="mt-10 grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
        <div><p className="font-mono text-[10px] font-black tracking-[.2em] text-emerald-300">HOST ONBOARDING / 0048</p><h1 className="mt-4 max-w-md font-mono text-5xl font-black uppercase leading-[.86] tracking-[-.1em]">Share your<br /><span className="text-violet-300">subscription.</span></h1><p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Set the details once. We&apos;ll use them to calculate your member split and payout.</p><div className="mt-10 flex max-w-xs flex-col gap-2">{["SELECT SUBSCRIPTION", "TIER & COST", "VISIBILITY", "CREDENTIALS", "PAYOUT", "REVIEW SUMMARY"].map((label, index) => <div key={label} className={`flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 font-mono text-[10px] font-black ${index === 1 ? "border-emerald-300 bg-slate-900 text-emerald-300 shadow-[3px_3px_0_#34d399]" : index < 1 ? "border-emerald-300/50 bg-slate-950 text-emerald-300" : "border-slate-700 bg-slate-900 text-slate-500"}`}><span className={`grid size-6 place-items-center rounded-full border-2 border-current text-[9px] ${index < 1 ? "border-none bg-emerald-300 text-slate-950" : ""}`}>{index < 1 ? "✓" : String(index + 1).padStart(2, "0")}</span><span>{label}</span></div>)}</div><p className="mt-4 font-mono text-[10px] font-black text-slate-500">STEP 2 OF 6</p></div>
        <div className="rounded-3xl border-[3px] border-black bg-slate-950 p-5 shadow-[9px_9px_0_#34d399] sm:p-8">
          <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] font-black tracking-[.16em] text-violet-300">TIER &amp; COST</p><h2 className="mt-2 font-mono text-2xl font-black">Custom split parameters</h2></div><Sparkles className="text-amber-300" size={24} /></div>
          <label className="mt-8 block font-mono text-[10px] font-black text-violet-200">01 / SUBSCRIPTION NAME<input value={name} onChange={e => onName(e.target.value)} placeholder="e.g. Figma Professional" className={`mt-2 w-full rounded-xl border-[3px] px-4 py-4 font-mono text-base font-black outline-none transition focus:border-violet-300 ${field}`} /></label>
          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"><label className="block font-mono text-[10px] font-black text-emerald-200"><span className="block tracking-[.14em]">02 / PRICE</span><input type="number" min="1" value={price} onChange={e => onPrice(e.target.value)} placeholder="649" className={`mt-2 w-full rounded-xl border-[3px] px-4 py-4 font-mono text-2xl font-black outline-none transition focus:border-emerald-300 ${field}`} /></label><div className="grid gap-3"><div className="flex rounded-xl border-2 border-slate-700 bg-slate-900 p-1"><button type="button" onClick={() => onBilling("Monthly")} className={`flex-1 rounded-lg px-4 py-3 font-mono text-[10px] font-black transition-colors ${billing === "Monthly" ? "bg-emerald-300 text-slate-950 shadow-[2px_2px_0_#020617]" : "text-slate-400 hover:text-emerald-300"}`}>MONTHLY</button><button type="button" onClick={() => onBilling("Yearly")} className={`flex-1 rounded-lg px-4 py-3 font-mono text-[10px] font-black transition-colors ${billing === "Yearly" ? "bg-violet-300 text-slate-950 shadow-[2px_2px_0_#020617]" : "text-slate-400 hover:text-violet-300"}`}>YEARLY</button></div>{billing === "Monthly" && <label className="flex items-center justify-between gap-3 rounded-xl border-2 border-emerald-300/40 bg-slate-900 px-3 py-2.5 font-mono"><span className="grid gap-0.5"><span className="text-[9px] font-black tracking-[.14em] text-emerald-200">BILLING TERM</span><span className="text-[10px] font-bold text-slate-400">How many months?</span></span><span className="flex items-center gap-2"><input aria-label="Number of months" type="number" min="1" max="12" value={monthlyMonths} onChange={e => onMonthlyMonths(e.target.value)} className={`w-16 rounded-lg border-2 px-2 py-2 text-center font-mono text-sm font-black outline-none focus:border-emerald-300 ${field}`} /></span></label>}</div></div>
          <div className="mt-6 rounded-2xl border-[3px] border-amber-300/80 bg-slate-900 p-4 shadow-[4px_4px_0_#fbbf24]"><div className="flex items-center justify-between"><label className="font-mono text-[10px] font-black text-amber-200">03 / MEMBER LIMIT</label><span className="font-mono text-[9px] text-slate-400">EXCLUDING YOU</span></div><div className="mt-3 flex items-center justify-between gap-4"><button type="button" onClick={() => onLimit(String(Math.max(1, Number(limit || 1) - 1)))} className="grid size-12 place-items-center rounded-xl border-2 border-amber-300 bg-slate-950 text-amber-300 transition hover:bg-amber-300 hover:text-slate-950"><Minus size={18} /></button><span className="font-mono text-5xl font-black text-amber-300">{limit || 1}</span><button type="button" onClick={() => onLimit(String(Math.min(12, Number(limit || 1) + 1)))} className="grid size-12 place-items-center rounded-xl border-2 border-amber-300 bg-slate-950 text-amber-300 transition hover:bg-amber-300 hover:text-slate-950"><Plus size={18} /></button></div></div>
          <div className="mt-6 flex items-center justify-between border-t-2 border-slate-800 pt-5"><span className="font-mono text-[10px] text-slate-400">EST. PAYOUT / MEMBER</span><strong className="font-mono text-xl text-emerald-300">₹{Math.round((Number(price) || 0) / Math.max(1, Number(limit) || 1))}</strong></div>
          <div className="mt-6 flex justify-end"><button disabled={!name.trim() || !price} onClick={onNext} className="inline-flex items-center gap-2 rounded-xl border-[3px] border-black bg-emerald-300 px-5 py-3 font-mono text-[10px] font-black text-slate-950 shadow-[4px_4px_0_#fbbf24] transition hover:translate-x-0.5 hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">CONTINUE TO SEATS <ArrowRight size={15} /></button></div>
        </div>
      </div>
    </div>
  </section>
}
