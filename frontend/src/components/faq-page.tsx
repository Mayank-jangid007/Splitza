'use client'

import Link from 'next/link'
import { useId, useState, type CSSProperties } from 'react'
import { ArrowLeft, Crown, LifeBuoy, Plus, Rocket, ShieldCheck, Sparkles, Ticket, type LucideIcon } from 'lucide-react'
import { CATEGORIES, FAQ, type CategoryKey } from './faq-data'

const INK = '#151515'
const DASHBOARD_HREF = '/dashboard'

const ICONS: Record<CategoryKey, LucideIcon> = {
  All: Sparkles,
  'Getting started': Rocket,
  'Payments & escrow': ShieldCheck,
  Hosting: Crown,
  Joining: Ticket,
  'Problems & safety': LifeBuoy,
}

const colorOf = (key: string) => CATEGORIES.find((c) => c.key === key)?.color ?? '#fff'

const box = 'border-[2.5px] border-[#151515] shadow-[4px_4px_0_0_#151515]'
const boxSm = 'border-[2.5px] border-[#151515] shadow-[3px_3px_0_0_#151515]'
const press =
  'transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#151515] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'

const mono: CSSProperties = { fontFamily: 'var(--font-space-mono), ui-monospace, monospace' }

/** Soft, rounded 12-petal flower used in the hero. */
function flowerPath(cx: number, cy: number, r: number, n: number, amp: number) {
  let d = ''
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * 2 * Math.PI
    const rr = r + amp * Math.abs(Math.cos((n * a) / 2))
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`
  }
  return d + 'Z'
}
const FLOWER = flowerPath(50, 50, 34, 12, 11)

function Flower({ color, className, stroke = 3 }: { color: string; className?: string; stroke?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className}>
      <path d={FLOWER} fill={color} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
    </svg>
  )
}

function Spark({ style, size }: { style: CSSProperties; size: number }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute animate-pulse"
      style={style}
      width={size}
      height={size}
      viewBox="-14 -14 28 28"
      fill="#fff"
      stroke={INK}
      strokeWidth={2.4}
      strokeLinejoin="round"
    >
      <path d="M0 -12Q0 0 12 0Q0 0 0 12Q0 0 -12 0Q0 0 0 -12z" />
    </svg>
  )
}

function DoodlePattern({ id }: { id: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".28">
            <path d="M6 14q5-8 10 0t10 0" />
            <path d="M44 10v10M39 15h10" />
            <circle cx="48" cy="46" r="4" />
            <path d="M12 44l4 4 4-4M16 40v8" />
            <path d="M30 34l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function FaqPage() {
  const uid = useId()
  const [category, setCategory] = useState<CategoryKey>('All')
  const [open, setOpen] = useState<Set<number>>(new Set([3])) // first escrow answer starts open

  const items = FAQ.map((f, i) => ({ ...f, i })).filter((f) => category === 'All' || f.category === category)

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div
      className="min-h-screen pb-20 text-[#151515]"
      style={{
        fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
        backgroundColor: '#fbf6ee',
        backgroundImage: 'radial-gradient(rgba(21,21,21,.15) 1.3px, transparent 1.4px)',
        backgroundSize: '26px 26px',
      }}
    >
      <header className="mx-auto flex max-w-[1100px] items-center justify-start px-4 pt-5 sm:px-8">
        <Link
          href={DASHBOARD_HREF}
          className={`flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-extrabold ${boxSm} ${press}`}
        >
          <ArrowLeft className="size-4" strokeWidth={3} aria-hidden="true" />
          Back to dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-8">
        {/* hero */}
        <section
          aria-label="FAQ intro"
          className={`relative overflow-hidden rounded-[32px] bg-[#b3a6f7] p-5 sm:px-10 sm:py-8 ${box}`}
        >
          <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
            <defs>
              <pattern id={`${uid}-plus`} width="34" height="34" patternUnits="userSpaceOnUse">
                <path d="M17 10v14M10 17h14" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".25" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uid}-plus)`} />
          </svg>
          <Flower
            color="#f8d56b"
            className="absolute -right-10 -top-14 size-32 animate-[spin_26s_linear_infinite] sm:size-52"
          />
          <Spark style={{ left: '62%', top: '14%' }} size={26} />
          <Spark style={{ left: '78%', top: '60%' }} size={20} />

          <div className="relative z-10 flex flex-col gap-3">
            <p
              className="w-fit rounded-full border-2 border-[#151515] bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
              style={mono}
            >
              Help centre
            </p>
            <h1 className="max-w-[760px] text-[clamp(42px,7vw,84px)] font-extrabold leading-[.88] tracking-[-0.06em]">
              Got
              <br />
              questi
              <Flower color="#f5aee3" stroke={4} className="mx-[-.02em] inline-block size-[.8em] translate-y-[.04em]" />
              ns?
            </h1>
          </div>
        </section>

        {/* categories */}
        <div
          role="tablist"
          aria-label="Categories"
          className="-mx-4 mt-7 flex gap-2.5 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((c) => {
            const on = category === c.key
            const Icon = ICONS[c.key]
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setCategory(c.key)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold ${boxSm} ${press}`}
                style={{ background: on ? c.color : '#fff' }}
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 place-items-center rounded-full border-2 border-[#151515]"
                  style={{ background: on ? '#fff' : c.color }}
                >
                  <Icon className="size-4" strokeWidth={2.4} />
                </span>
                {c.key}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          {/* questions */}
          <section aria-label="Questions" className="lg:col-span-8">
            <p
              role="status"
              aria-live="polite"
              className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6b6558]"
              style={mono}
            >
              {items.length ? `${items.length} question${items.length > 1 ? 's' : ''}${category !== 'All' ? ` · ${category}` : ''}` : ''}
            </p>

            {items.length === 0 ? (
              <div className={`flex flex-col items-center gap-3 rounded-[28px] bg-white p-8 text-center ${box}`}>
                <h3 className="text-xl font-extrabold">No answers found</h3>
                <p className="max-w-[300px] text-sm font-semibold text-[#4a463d]">
                  Nothing here yet in this category. Try another one, or ask us using the help card.
                </p>
                <button
                  type="button"
                  onClick={() => setCategory('All')}
                  className={`rounded-full bg-[#f8d56b] px-5 py-2 text-sm font-extrabold ${boxSm} ${press}`}
                >
                  Show all
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((f) => {
                  const isOpen = open.has(f.i)
                  const col = colorOf(f.category)
                  return (
                    <article key={f.i} className={`overflow-hidden rounded-[26px] bg-white ${box}`}>
                      <h3>
                        <button
                          type="button"
                          id={`${uid}-q${f.i}`}
                          aria-expanded={isOpen}
                          aria-controls={`${uid}-a${f.i}`}
                          onClick={() => toggle(f.i)}
                          className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                        >
                          <span
                            className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-[#151515] text-xs font-bold"
                            style={{ background: col, ...mono }}
                          >
                            {String(f.i + 1).padStart(2, '0')}
                          </span>
                          <span className="flex-1 text-[17px] font-extrabold leading-snug tracking-[-0.01em] sm:text-lg">
                            {f.q}
                          </span>
                          <span
                            aria-hidden="true"
                            className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-[#151515] transition-colors"
                            style={{ background: isOpen ? INK : '#fff', color: isOpen ? '#f8d56b' : INK }}
                          >
                            <Plus
                              className={`size-5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                              strokeWidth={3}
                            />
                          </span>
                        </button>
                      </h3>
                      <div
                        id={`${uid}-a${f.i}`}
                        role="region"
                        aria-labelledby={`${uid}-q${f.i}`}
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t-[2.5px] border-dashed border-[#151515]/30 px-4 pb-5 pt-4 sm:px-5 sm:pl-[76px]">
                            <p className="max-w-[560px] text-[15px] font-semibold leading-relaxed text-[#3d3a32]">{f.a}</p>
                            <span
                              className="mt-3 inline-block rounded-full border-2 border-[#151515] px-2.5 py-0.5 text-[10px] font-bold"
                              style={{ background: col, ...mono }}
                            >
                              {f.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* help card */}
          <aside className="lg:col-span-4">
            <div className={`relative overflow-hidden rounded-[32px] bg-[#f8d56b] p-6 lg:sticky lg:top-6 ${box}`}>
              <DoodlePattern id={`${uid}-doodle`} />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={mono}>
                  Still stuck?
                </p>
                <h2 className="mt-1 max-w-[220px] text-[28px] font-extrabold leading-[.98] tracking-[-0.03em]">
                  We&apos;re a message away.
                </h2>
                <p className="mt-3 text-sm font-semibold text-[#3d3a32]">
                  Can&apos;t log in to a shared account? Report it and the host&apos;s payout is frozen until it&apos;s fixed.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-full bg-[#ff6b5e] px-5 py-3 text-[15px] font-extrabold ${box} ${press}`}
                  >
                    🚨 Report an access issue
                  </button>
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-extrabold ${boxSm} ${press}`}
                  >
                    ✉️ Contact support
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
