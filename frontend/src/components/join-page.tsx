"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, Clock3, Lock, LoaderCircle, RefreshCw, ShieldCheck, Smartphone } from "lucide-react"
import type { MarketplacePool } from "@/components/marketplace-view"

export function JoinPage({ pool, dark, onBack }: { pool: MarketplacePool; dark: boolean; onBack: () => void }) {
  const [isPaymentStep, setIsPaymentStep] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [seconds, setSeconds] = useState(300)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!isPaymentStep || submitted) return
    const timer = window.setInterval(() => setSeconds(v => (v > 0 ? v - 1 : 300)), 1000)
    return () => window.clearInterval(timer)
  }, [isPaymentStep, submitted])

  const minutes          = String(Math.floor(seconds / 60)).padStart(2, "0")
  const remainingSeconds = String(seconds % 60).padStart(2, "0")
  const surface          = dark ? "border-white bg-black" : "border-black bg-[#F7F4EC]"
  const muted            = dark ? "text-neutral-400" : "text-neutral-600"
  const accent           = dark ? "#D9F9DF" : "#9FA1FF"

  const dailyRate  = Math.round(pool.price / (pool.term * 30))
  const fairPrice  = dailyRate * pool.remainingDays

  // ── Confirmed screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className={`min-h-screen px-4 py-8 font-sans ${dark ? "bg-black text-white" : "bg-[#F7F4EC] text-neutral-950"}`}>
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <section className={`w-full rounded-2xl border-[3px] p-8 text-center shadow-[8px_8px_0_#D9F9DF] ${surface}`}>
            <div className="mx-auto grid size-16 place-items-center rounded-full border-[3px] border-black bg-[#D9F9DF] text-black shadow-[4px_4px_0_#B5BAFF]">
              <Check size={30} strokeWidth={3} />
            </div>
            <p className="mt-7 font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9FA1FF]">Request confirmed</p>
            <h1 className="mt-3 font-mono text-3xl font-black uppercase tracking-[-.06em]">Seat secured.</h1>
            <p className={`mx-auto mt-4 max-w-sm text-sm leading-6 ${muted}`}>
              Your join request for <strong>{pool.service}</strong> has been sent to the host. We&apos;ll unlock access after the escrow payment is verified.
            </p>
            <button
              onClick={onBack}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#D9F9DF] px-5 py-3 font-mono text-[10px] font-black uppercase text-black shadow-[4px_4px_0_#B5BAFF]"
            >
              Back to groups <ArrowLeft size={15} />
            </button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen px-4 py-6 font-sans sm:px-6 ${dark ? "bg-black text-white" : "bg-[#F7F4EC] text-neutral-950"}`}>
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 font-mono text-[10px] font-black uppercase shadow-[3px_3px_0_currentColor] ${dark ? "border-white text-white" : "border-black text-black"}`}
        >
          <ArrowLeft size={14} /> Back to groups
        </button>

        {/* ── Step 1: Plan verification ── */}
        {!isPaymentStep ? (
          <section className="mx-auto mt-10 max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9FA1FF]">
              <span className="grid size-7 place-items-center rounded-full border-2 border-current">01</span>
              Plan verification
            </div>

            {/* Header */}
            <div className="mt-7 flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-[3px] border-current bg-[#D9F9DF] font-mono text-2xl font-black text-black shadow-[4px_4px_0_#B5BAFF]">
                  {pool.logoUrl
                    ? <img src={pool.logoUrl} alt={pool.service} className="size-full object-contain p-2" />
                    : pool.service.charAt(0)
                  }
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9FA1FF]">Shared subscription</p>
                  <h1 className="mt-3 font-mono text-4xl font-black uppercase leading-[.94] tracking-[-.07em] sm:text-6xl">{pool.service}</h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border-2 border-current px-3 py-1 font-mono text-[10px] font-black uppercase">{pool.category}</span>
                    <span className="rounded-full border-2 border-current px-3 py-1 font-mono text-[10px] font-black uppercase">{pool.term}-month plan</span>
                  </div>
                </div>
              </div>
              <div className={`rounded-xl border-2 border-current px-4 py-3 font-mono text-[10px] font-black uppercase shadow-[3px_3px_0_currentColor]`}>
                Hosted by {pool.hostName}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Total seats",    `${pool.total}`,   `${pool.available} available`],
                ["Plan duration",  `${pool.term} mo`, "Fixed term"],
                ["Upfront split",  `₹${pool.price}`,  "Due at checkout"],
              ].map(([label, val, sub]) => (
                <div key={label} className={`rounded-xl border-2 p-4 ${surface}`}>
                  <p className={`font-mono text-[10px] font-black uppercase tracking-widest ${muted}`}>{label}</p>
                  <p className="mt-2 font-mono text-3xl font-black">{val}</p>
                  <p className={`mt-1 text-xs ${muted}`}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Fair price */}
            <div className={`mt-6 rounded-2xl border-2 p-5 ${surface}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#9FA1FF]">YOUR FAIR PRICE</p>
                  <p className="mt-2 font-mono text-4xl font-black">₹{fairPrice}</p>
                </div>
                <p className={`rounded-full border-2 border-current px-3 py-2 font-mono text-[10px] font-black uppercase ${muted}`}>
                  {pool.remainingDays} days left until this group expires.
                </p>
              </div>
              <p className={`mt-3 text-sm leading-6 ${muted}`}>
                You are only paying for the exact {pool.remainingDays} days left in this plan. No overcharging.
              </p>
              <p className={`mt-5 border-t border-current/20 pt-3 text-[10px] ${muted}`}>
                Plan Cost: ₹{dailyRate} per day × {pool.remainingDays} days remaining.
              </p>
            </div>

            {/* Rules */}
            <div className={`mt-8 rounded-2xl border-2 p-5 ${surface}`}>
              <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#9FA1FF]">Plan rules</p>
              <div className={`mt-3 grid gap-2 text-sm leading-6 ${muted}`}>
                <p>Rule 1: Upfront payment covers the full fixed term.</p>
                <p>Rule 2: Strictly one stream/profile per seat.</p>
                <p>Rule 3: Do not share credentials externally.</p>
                <p>Rule 4: The host manages access and confirms your assigned seat.</p>
              </div>
            </div>

            <button
              onClick={() => setIsPaymentStep(true)}
              className="mt-7 w-full rounded-xl border-[3px] border-black bg-[#D9F9DF] px-5 py-4 font-mono text-sm font-black uppercase text-black shadow-[5px_5px_0_#B5BAFF] transition hover:translate-y-0.5 hover:shadow-[3px_3px_0_#B5BAFF]"
            >
              Request to Join
            </button>
            <p className={`mt-3 text-center text-xs ${muted}`}>You will not be charged yet. Review payment terms on the next step.</p>
          </section>

        ) : (
          /* ── Step 2: Escrow payment ── */
          <section className="mx-auto mt-10 max-w-xl">
            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[.2em] text-[#9FA1FF]">
              <span className="grid size-7 place-items-center rounded-full border-2 border-current">02</span>
              Secure escrow payment
            </div>

            <div className={`rounded-2xl border-[3px] p-5 sm:p-7 ${surface}`} style={{ boxShadow: `7px 7px 0 ${accent}` }}>
              <div className="text-center">
                <LoaderCircle className="mx-auto animate-spin" size={36} strokeWidth={2.5} style={{ color: accent }} />
                <h1 className="mt-5 font-mono text-xl font-black uppercase tracking-[-.04em]">
                  Awaiting automatic transaction confirmation from your UPI app...
                </h1>
                <p className={`mt-3 text-sm leading-6 ${muted}`}>
                  Once you enter your UPI PIN inside Google Pay, PhonePe, or Paytm, this screen will automatically refresh and unlock your room access.
                </p>
              </div>

              {/* QR */}
              <div className="mt-6 text-center">
                <div className={`mx-auto grid aspect-square w-48 place-items-center rounded-2xl border-[3px] border-current bg-white p-4 text-black`} style={{ boxShadow: `6px 6px 0 ${accent}` }}>
                  <div className="grid size-full place-items-center border-4 border-dashed border-black">
                    <div className="grid size-24 place-items-center border-8 border-black font-mono text-3xl font-black">UPI</div>
                  </div>
                </div>
                <p className={`mx-auto mt-4 max-w-md text-xs leading-5 ${muted}`}>
                  Scan this QR code using any UPI App (Google Pay, PhonePe, Paytm, BHIM) to instantly authorize your upfront payment.
                </p>
                <p className={`mt-5 font-mono text-[10px] font-black uppercase tracking-widest ${muted}`}>Or select a direct application link:</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {["Google Pay", "PhonePe", "Paytm"].map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setIsChecking(true)}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-3 font-mono text-[10px] font-black uppercase ${dark ? "border-white" : "border-black"}`}
                    >
                      <Smartphone size={15} /> {app}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className={`mt-5 rounded-xl border-2 p-4 ${dark ? "border-white/40" : "border-black/40"}`}>
                <div className="flex items-center justify-between font-mono text-[10px] font-black uppercase">
                  <span className="flex items-center gap-2"><Clock3 size={15} /> Payment window</span>
                  <strong className="text-lg">{minutes}:{remainingSeconds}</strong>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-current/15">
                  <div className="h-full bg-[#9FA1FF] transition-all" style={{ width: `${(seconds / 300) * 100}%` }} />
                </div>
              </div>

              {/* Escrow notice */}
              <div className={`mt-5 rounded-xl border-2 p-4 text-sm leading-6 ${muted}`}>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 shrink-0" size={19} style={{ color: accent }} />
                  <p>
                    <strong className="text-current">Escrow protection:</strong> Your payment is held securely until the host confirms your seat and access is ready.
                  </p>
                </div>
              </div>

              {/* Verify button */}
              <button
                onClick={() => {
                  setIsChecking(true)
                  window.setTimeout(() => {
                    setIsChecking(false)
                    setSubmitted(true)
                  }, 1200)
                }}
                disabled={isChecking}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-black bg-[#D9F9DF] px-5 py-4 font-mono text-sm font-black uppercase text-black shadow-[5px_5px_0_#B5BAFF] disabled:opacity-60"
              >
                {isChecking
                  ? <><RefreshCw className="animate-spin" size={16} /> Checking status...</>
                  : <><Lock size={16} /> Verify payment status</>
                }
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
