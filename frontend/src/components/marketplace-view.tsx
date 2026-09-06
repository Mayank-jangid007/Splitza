"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Search, SearchX, Clapperboard, Cloud, GraduationCap, Headphones, Gamepad2, CircleEllipsis, Loader2 } from "lucide-react"
import { motion } from "motion/react"
import { poolsApi, type MarketplacePoolItem } from "@/lib/api"

// ─── MarketplacePool — internal type used across views ───────────────────────
export type MarketplacePool = {
  id: string
  service: string
  category: string
  term: number
  price: number
  available: number
  total: number
  accent: "red" | "green" | "blue" | "violet"
  kind: "PRE_STORED" | "CUSTOM"
  remainingDays: number
  hostName: string
  logoUrl: string | null
}

// ─── Logo map ─────────────────────────────────────────────────────────────────
const LOGO_MAP: Record<string, string> = {
  netflix:   "https://cdn.simpleicons.org/netflix/E50914",
  spotify:   "https://cdn.simpleicons.org/spotify/1ED760",
  youtube:   "https://cdn.simpleicons.org/youtube/FF0000",
  apple:     "https://cdn.simpleicons.org/apple/000000",
  canva:     "https://cdn.simpleicons.org/canva/00C4CC",
  prime:     "https://cdn.simpleicons.org/amazonaws/FF9900",
  amazon:    "https://cdn.simpleicons.org/amazonaws/FF9900",
  disney:    "https://cdn.simpleicons.org/disneyplus/006E99",
  hotstar:   "https://cdn.simpleicons.org/disneyplus/006E99",
  microsoft: "https://cdn.simpleicons.org/microsoft/00A4EF",
  adobe:     "https://cdn.simpleicons.org/adobe/FF0000",
}

function resolveLogoUrl(platformLogoUrl: string | null, name: string): string | null {
  if (platformLogoUrl) return platformLogoUrl
  const lower = name.toLowerCase()
  for (const [key, url] of Object.entries(LOGO_MAP)) {
    if (lower.includes(key)) return url
  }
  return null
}

// ─── Category detection ───────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Entertainment: ["netflix", "prime", "amazon", "disney", "hotstar", "jio", "zee", "sonyliv", "youtube"],
  Music:         ["spotify", "apple music", "jiosaavn", "gaana", "wynk"],
  Cloud:         ["microsoft", "google one", "dropbox", "icloud"],
  Education:     ["coursera", "udemy", "linkedin learning", "skillshare", "duolingo"],
  Games:         ["xbox", "playstation", "ea play", "gamepass", "nintendo"],
}

function resolveCategory(name: string): string {
  const lower = name.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return "Others"
}

const ACCENT_BY_CATEGORY: Record<string, "red" | "green" | "blue" | "violet"> = {
  Entertainment: "red",
  Music:         "green",
  Cloud:         "blue",
  Education:     "violet",
  Games:         "red",
  Others:        "blue",
}

// ─── Map API item → internal MarketplacePool ──────────────────────────────────
function mapApiPool(p: MarketplacePoolItem): MarketplacePool {
  const createdMs    = new Date(p.createdAt).getTime()
  const totalDays    = p.planMonths * 30
  const elapsedDays  = Math.floor((Date.now() - createdMs) / 86_400_000)
  const remainingDays = Math.max(1, totalDays - elapsedDays)
  const category     = resolveCategory(p.platformName)
  return {
    id:           p.id,
    service:      p.platformName,
    category,
    term:         p.planMonths,
    price:        p.pricePerSeat,
    available:    p.openSeats,
    total:        p.maxSeats,
    accent:       ACCENT_BY_CATEGORY[category] ?? "blue",
    kind:         p.isCustom ? "CUSTOM" : "PRE_STORED",
    remainingDays,
    hostName:     p.hostName,
    logoUrl:      resolveLogoUrl(p.platformLogoUrl, p.platformName),
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const categories = [
  ["Entertainment", Clapperboard,    "red"],
  ["Cloud",         Cloud,           "blue"],
  ["Education",     GraduationCap,   "violet"],
  ["Music",         Headphones,      "green"],
  ["Games",         Gamepad2,        "red"],
  ["Others",        CircleEllipsis,  "blue"],
] as const

const accentClasses = {
  red:    "bg-[#9FA1FF] text-neutral-950",
  green:  "bg-[#D9F9DF] text-neutral-950",
  blue:   "bg-[#AEE2FF] text-neutral-950",
  violet: "bg-[#B5BAFF] text-neutral-950",
}

// ─── Pool Card ────────────────────────────────────────────────────────────────
function PoolCard({ pool, onJoin, dark }: { pool: MarketplacePool; onJoin: (pool: MarketplacePool) => void; dark: boolean }) {
  const filledSeats = pool.total - pool.available
  const dailyRate   = Math.round(pool.price / (pool.term * 30))
  const fairPrice   = dailyRate * pool.remainingDays

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={() => onJoin(pool)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onJoin(pool) }}
      whileHover={{ x: 4 }}
      className={`grid cursor-pointer gap-4 rounded-xl border-2 p-4 transition-[border-color,box-shadow,background-color] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${dark ? "border-neutral-100 bg-black shadow-[2px_2px_0_#f5f5f5] hover:shadow-[3px_3px_0_#f5f5f5]" : "border-black bg-white shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]"}`}
    >
      {/* Logo / Avatar */}
      <div className="flex items-center gap-3">
        <span className={`grid size-11 place-items-center overflow-hidden rounded-lg border-2 border-black text-lg font-black shadow-[3px_3px_0_#000] ${pool.logoUrl ? "bg-white p-1.5" : accentClasses[pool.accent]}`}>
          {pool.logoUrl
            ? <img src={pool.logoUrl} alt={pool.service} className="size-full object-contain" />
            : pool.service.charAt(0)
          }
        </span>
        <div className="min-w-0 sm:hidden">
          <h3 className={`truncate font-mono text-sm font-black uppercase tracking-[-.04em] ${dark ? "text-neutral-50" : "text-neutral-950"}`}>{pool.service}</h3>
          <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">by {pool.hostName}</p>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="hidden items-center gap-3 sm:flex">
          <h3 className={`truncate font-mono text-sm font-black uppercase tracking-[-.04em] ${dark ? "text-neutral-50" : "text-neutral-950"}`}>{pool.service}</h3>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-300/10 px-2 py-1 font-mono text-[9px] font-black text-emerald-300">LIVE</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-md border px-2 py-1 font-mono text-[9px] font-black uppercase ${dark ? "border-neutral-600 bg-neutral-950 text-neutral-300" : "border-neutral-300 bg-neutral-100 text-neutral-700"}`}>{pool.term} mo</span>
          <span className={`rounded-md border px-2 py-1 font-mono text-[9px] font-black uppercase ${dark ? "border-neutral-600 bg-neutral-950 text-neutral-300" : "border-neutral-300 bg-neutral-100 text-neutral-700"}`}>{pool.category}</span>
          <span className="rounded-md border border-amber-400/40 bg-amber-300/10 px-2 py-1 font-mono text-[9px] font-black text-amber-300">₹{pool.price}/seat</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-amber-400/40 bg-amber-300/10 px-2 py-1 font-mono text-[9px] font-black text-amber-300">{pool.remainingDays} days left</span>
          <span className="rounded-md border border-violet-400/40 bg-violet-300/10 px-2 py-1 font-mono text-[9px] font-black text-violet-300">fair ₹{fairPrice}</span>
        </div>
        {/* Seat fill */}
        <div className="mt-3 flex items-center gap-3" aria-label={`${filledSeats} of ${pool.total} seats filled, ${pool.available} available`}>
          <div className="flex items-center" aria-hidden="true">
            {Array.from({ length: Math.min(filledSeats, 3) }).map((_, i) => (
              <span key={i} className={`grid size-6 place-items-center rounded-full border-2 border-neutral-950 bg-neutral-600 font-mono text-[8px] font-black text-neutral-300 ${i > 0 ? "-ml-2" : ""}`}>
                {String.fromCharCode(65 + i)}
              </span>
            ))}
            {filledSeats > 3 && <span className="-ml-1 grid size-6 place-items-center rounded-full border-2 border-neutral-950 bg-neutral-800 font-mono text-[8px] font-black text-neutral-100">+{filledSeats - 3}</span>}
          </div>
          <span className={`font-mono text-[10px] font-bold ${dark ? "text-neutral-300" : "text-neutral-600"}`}>{filledSeats}/{pool.total} filled</span>
          <span className="font-mono text-[10px] font-bold text-emerald-300">{pool.available} open</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-neutral-500 sm:hidden">Live pool</span>
        <button
          onClick={(e) => { e.stopPropagation(); onJoin(pool) }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-emerald-300 px-3 py-2 font-mono text-[10px] font-black uppercase text-emerald-950 transition hover:bg-amber-300 hover:shadow-[3px_3px_0_#000]"
        >
          Join <Check size={14} />
        </button>
      </div>
    </motion.article>
  )
}

// ─── Main MarketplaceView ─────────────────────────────────────────────────────
export function MarketplaceView({
  dark,
  onBack,
  onCreate,
  onJoin,
}: {
  dark: boolean
  onBack: () => void
  onCreate: () => void
  onJoin: (pool: MarketplacePool) => void
}) {
  const [query, setQuery]           = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [category, setCategory]     = useState<string | null>(null)
  const [rawPools, setRawPools]     = useState<MarketplacePool[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  // Fetch from backend with debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await poolsApi.getMarketplace({ search: query || undefined })
        if (res.ok) setRawPools(res.data.map(mapApiPool))
        else setError("Failed to load pools.")
      } catch {
        setError("Could not connect to server.")
      } finally {
        setLoading(false)
      }
    }, query ? 400 : 0)
    return () => clearTimeout(timer)
  }, [query])

  // Client-side category filter
  const filtered = useMemo(
    () => (category ? rawPools.filter(p => p.category === category) : rawPools),
    [rawPools, category]
  )

  const selectedCategory   = categories.find(([name]) => name === category)
  const SelectedCategoryIcon = selectedCategory?.[1]

  return (
    <main className={`min-h-screen px-4 pb-16 pt-4 font-sans sm:px-6 lg:px-10 ${dark ? "bg-black text-neutral-50" : "bg-slate-50 text-neutral-950"}`}>
      <div className="mx-auto max-w-[1220px]">

        {/* Back */}
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 font-mono text-[10px] font-black uppercase transition hover:-translate-y-0.5 ${dark ? "border-neutral-100 bg-neutral-950 text-neutral-100 shadow-[3px_3px_0_#f5f5f5] hover:shadow-[5px_5px_0_#f5f5f5]" : "border-black bg-white text-neutral-950 shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000]"}`}
            aria-label="Go back to dashboard"
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <p className="font-mono text-[9px] font-black uppercase tracking-widest text-neutral-500">
            {loading ? "Loading..." : `${filtered.length} public pool${filtered.length !== 1 ? "s" : ""} live`}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex justify-center">
          <label
            className={`group flex items-center overflow-hidden rounded-lg border-[1.5px] outline-none transition-[width,padding,box-shadow,background-color,border-color] duration-300 ${dark ? "border-white bg-black text-white shadow-[2.5px_3px_0_white] focus-within:shadow-[5.5px_7px_0_white]" : "border-black bg-[#F7F4EC] text-neutral-500 shadow-[2.5px_3px_0_#000] focus-within:shadow-[5.5px_7px_0_#000]"} ${searchOpen ? "w-full max-w-[420px] gap-3 p-3.5" : "w-14 cursor-text justify-center p-3.5"}`}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={20} strokeWidth={2.5} className="shrink-0" />
            <input
              aria-label="Search active groups"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search active groups..."
              className={`min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500 ${dark ? "text-neutral-100" : "text-neutral-950"} ${searchOpen ? "opacity-100" : "pointer-events-none w-0 opacity-0"}`}
            />
          </label>
        </div>

        {/* Categories */}
        <section className="py-8">
          <h2 className="font-mono text-sm font-black uppercase tracking-widest">Popular Categories</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(([name, Icon, color]) => (
              <button
                key={name}
                aria-label={`Filter by ${name}`}
                onClick={() => setCategory(category === name ? null : name)}
                className={`group relative grid min-h-28 place-items-center overflow-hidden rounded-xl border-2 border-black p-3 text-left shadow-[3px_3px_0_#000] transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#000] ${category === name ? accentClasses[color] : dark ? "bg-neutral-900 text-neutral-100" : "bg-white text-neutral-950"}`}
              >
                <span className="absolute -right-2 -top-2 rotate-12 opacity-10 transition group-hover:rotate-0 group-hover:opacity-20"><Icon size={80} strokeWidth={1.4} /></span>
                <span className="relative grid size-12 rotate-[-6deg] place-items-center rounded-lg border-2 border-current bg-transparent shadow-[2px_2px_0_currentColor] transition group-hover:rotate-3"><Icon size={23} strokeWidth={2.5} /></span>
                <span className="relative mt-2 font-mono text-[10px] font-black uppercase tracking-wider">{name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Active category pill */}
        {selectedCategory && SelectedCategoryIcon && (
          <div className="mb-6 flex items-center justify-center">
            <div className={`relative inline-flex items-center gap-3 rounded-full border-2 border-current px-4 py-2 shadow-[0_0_18px_currentColor] ${accentClasses[selectedCategory[2]]}`}>
              <span className="grid size-7 place-items-center rounded-full border-2 border-current bg-transparent"><SelectedCategoryIcon size={15} strokeWidth={2.5} /></span>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.14em]">{selectedCategory[0]} pools</span>
              <span className="rounded-full bg-current px-2 py-1 font-mono text-[9px] font-black uppercase text-black">{filtered.length} live</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid min-h-72 place-items-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={36} className="animate-spin text-emerald-300" />
              <p className="font-mono text-sm font-black uppercase tracking-widest text-neutral-500">Fetching live pools...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="grid min-h-72 place-items-center rounded-2xl border-2 border-dashed border-red-500/50 px-6 text-center">
            <div>
              <p className="font-mono text-lg font-black uppercase text-red-400">{error}</p>
              <button onClick={() => setQuery(q => q + " ")} className="mt-4 rounded-lg border-2 border-black bg-emerald-300 px-4 py-2 font-mono text-[10px] font-black uppercase text-neutral-950">Retry</button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <section className="grid min-h-72 place-items-center rounded-2xl border-2 border-dashed border-neutral-600 px-6 text-center">
            <div>
              <div className="relative mx-auto grid size-24 place-items-center rotate-[-4deg] rounded-[2rem] border-[3px] border-neutral-100 bg-[#B5BAFF] text-neutral-950 shadow-[5px_5px_0_#f5f5f5]">
                <SearchX size={42} strokeWidth={2.5} />
                <span className="absolute -right-3 -top-3 grid size-8 rotate-12 place-items-center rounded-full border-2 border-neutral-950 bg-[#D9F9DF] font-mono text-sm font-black">!</span>
                <span className="absolute -bottom-2 -left-3 h-3 w-10 rotate-[-18deg] rounded-full border-b-[3px] border-neutral-100" aria-hidden="true" />
              </div>
              <h2 className="mt-6 font-mono text-xl font-black uppercase">No pools active for this search.</h2>
              <p className="mt-2 text-sm text-neutral-400">Try creating your own pool!</p>
              <button onClick={onCreate} className="mt-5 rounded-lg border-[3px] border-black bg-amber-300 px-5 py-3 font-mono text-[10px] font-black uppercase text-neutral-950 shadow-[4px_4px_0_#34d399]">Create a Pool Instead</button>
            </div>
          </section>
        )}

        {/* Pool list */}
        {!loading && !error && filtered.length > 0 && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-mono text-2xl font-black uppercase tracking-[-.05em]">Matching Pools</h2>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-neutral-500">{filtered.length} results</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map(pool => (
                <PoolCard key={pool.id} pool={pool} onJoin={onJoin} dark={dark} />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
