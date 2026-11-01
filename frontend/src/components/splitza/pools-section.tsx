'use client'

import { ArrowRight, ChevronDown, ChevronUp, Plus, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Pool } from '@/lib/splitza'
import { PoolCard } from './home-pool-card'
import { Chip, NeoButton } from './ui'

export type PoolFilter = 'all' | 'hosted' | 'joined'

const FILTERS: { id: PoolFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hosted', label: 'Hosted by me' },
  { id: 'joined', label: 'Joined' },
]

const ACCENTS = ['bg-lav-soft', 'bg-sun/70', 'bg-mint/60', 'bg-sky/60']

export function PoolsSection({
  pools,
  onOpenPool,
  onShare,
  onBrowse,
}: {
  pools: Pool[]
  onOpenPool: (pool: Pool) => void
  onShare: () => void
  onBrowse: () => void
}) {
  const [filter, setFilter] = useState<PoolFilter>('all')
  const [showAll, setShowAll] = useState(false)

  const counts = {
    all: pools.length,
    hosted: pools.filter((p) => p.role === 'hosted').length,
    joined: pools.filter((p) => p.role === 'joined').length,
  }
  const filtered = pools.filter((p) => filter === 'all' || p.role === filter)
  const visible = showAll ? filtered : filtered.slice(0, 2)
  const hiddenCount = filtered.length - visible.length

  return (
    <section id="pools" aria-labelledby="pools-title" className="scroll-mt-24">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]">/ Hosted + joined</p>
          <h2 id="pools-title" className="font-display-tight text-3xl font-black sm:text-5xl">
            My pools
          </h2>
        </div>
        <div
          role="tablist"
          aria-label="Filter pools"
          hidden={pools.length === 0}
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border-2 border-ink bg-paper p-1 shadow-neo-sm"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => {
                  setFilter(f.id)
                  setShowAll(false)
                }}
                className={cn(
                  'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ink/30',
                  active ? 'bg-sun' : 'hover:bg-cream',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'grid min-w-6 place-items-center rounded-full border-2 border-ink px-1.5 text-[11px] leading-5',
                    active ? 'bg-ink text-paper' : 'bg-paper',
                  )}
                >
                  {counts[f.id]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8" role="tabpanel">
        {pools.length === 0 ? (
          <FirstRun onShare={onShare} onBrowse={onBrowse} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            body={
              filter === 'hosted'
                ? "You haven't hosted a pool yet. Share one of your subscriptions to fill its seats."
                : "You haven't joined a pool yet. Find an open seat in the marketplace."
            }
          >
            {filter === 'hosted' ? (
              <NeoButton tone="sun" onClick={onShare}>
                <Plus className="size-4" strokeWidth={3} />
                Share a subscription
              </NeoButton>
            ) : (
              <NeoButton tone="sun" onClick={onBrowse}>
                Join a subscription
                <ArrowRight className="size-4" strokeWidth={3} />
              </NeoButton>
            )}
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {visible.map((pool, i) => (
                <PoolCard key={pool.id} pool={pool} onOpen={onOpenPool} accent={ACCENTS[i % ACCENTS.length]} />
              ))}
            </div>
            {(filtered.length > 2 || showAll) && (
              <div className="mt-8 flex justify-center">
                <NeoButton tone="ink" size="md" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
                  {showAll ? (
                    <>
                      Show fewer <ChevronUp className="size-4" strokeWidth={3} />
                    </>
                  ) : (
                    <>
                      See all pools ({filtered.length})
                      <span className="sr-only"> — {hiddenCount} more hidden</span>
                      <ChevronDown className="size-4" strokeWidth={3} />
                    </>
                  )}
                </NeoButton>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

const PATHS = [
  {
    key: 'host',
    image: '/illustrations/host-doodle.png',
    alt: 'Illustrated person holding a subscription ticket and a padlock',
    badge: 'I pay for a plan',
    badgeTone: 'lav',
    title: 'Host a pool',
    blurb: 'Turn the plan you already pay for into shared seats.',
    steps: ['Add your plan and set the seats', 'Members pay by UPI into escrow', 'You get paid after the protection window'],
    cta: 'Share a plan',
  },
  {
    key: 'join',
    image: '/illustrations/join-doodle.png',
    alt: 'Illustrated person pointing at a floating chair token with a plus sign',
    badge: 'I want a plan',
    badgeTone: 'sun',
    title: 'Join a pool',
    blurb: 'Grab an open seat and pay only your share.',
    steps: ['Pick an open seat you like', 'Pay your share by UPI', 'Login details unlock once paid'],
    cta: 'Browse plans',
  },
] as const

const FIRST_RUN_STATS = [
  { label: 'Pools', value: '0' },
  { label: 'Seats filled', value: '0/4' },
  { label: 'Saved so far', value: '\u20B90' },
]

function FirstRun({ onShare, onBrowse }: { onShare: () => void; onBrowse: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-[32px] border-2 border-ink bg-sky p-6 shadow-neo sm:p-10">
        <div aria-hidden="true" className="dots-bg pointer-events-none absolute inset-0 opacity-40" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 -left-28 size-64 rounded-full border-2 border-ink bg-sun/80"
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="text-center lg:text-left">
            <Chip tone="paper">
              <Sparkles className="size-3.5" strokeWidth={3} aria-hidden="true" />
              Welcome aboard
            </Chip>
            <h3 className="font-display-tight mt-4 text-4xl font-black sm:text-5xl lg:text-6xl">
              Create your first pool.
            </h3>
            <p className="mx-auto mt-4 max-w-md text-sm font-medium sm:text-base lg:mx-0">
              No pools yet. Host one or join one to fill this space.
            </p>
            <dl className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              {FIRST_RUN_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border-2 border-ink bg-paper px-4 py-2 text-left shadow-neo-sm"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">{stat.label}</dt>
                  <dd className="font-display-tight text-xl font-black">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[320px] rotate-2">
            <div className="rounded-[28px] border-2 border-ink bg-paper p-2 shadow-neo">
              <div className="relative aspect-square overflow-hidden rounded-[20px] border-2 border-ink">
                <Image
                  src="/illustrations/first-pool.png"
                  alt="Illustrated person holding up an empty seat sign"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-2 shadow-neo-sm">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.14em]">Seats</span>
              {[0, 1, 2, 3].map((n) => (
                <span
                  key={n}
                  aria-hidden="true"
                  className={cn(
                    'grid size-6 place-items-center rounded-full border-2 border-dashed border-ink',
                    n === 0 && 'bg-mint',
                  )}
                >
                  {n === 0 && <Plus className="size-3" strokeWidth={4} />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PATHS.map((p, i) => (
          <article
            key={p.key}
            className="group flex flex-col overflow-hidden rounded-[28px] border-2 border-ink bg-paper shadow-neo transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-ink">
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 560px, 100vw"
                className="object-cover object-[50%_25%] transition-transform duration-300 group-hover:scale-105"
              />
              <Chip tone={p.badgeTone} className="absolute left-4 top-4 bg-clip-padding shadow-neo-sm">
                {p.badge}
              </Chip>
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <h4 className="font-display-tight text-3xl font-black">{p.title}</h4>
              <p className="mt-1.5 text-sm text-ink/70">{p.blurb}</p>
              <ol className="mt-5 flex flex-col">
                {p.steps.map((s, n) => (
                  <li key={s} className="relative flex items-start gap-3 pb-4 text-sm font-medium last:pb-0">
                    {n < p.steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-3 top-7 border-l-2 border-dashed border-ink/40"
                      />
                    )}
                    <span
                      className={cn(
                        'relative grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink text-[11px] font-bold',
                        i === 0 ? 'bg-lav' : 'bg-sun',
                      )}
                    >
                      {n + 1}
                    </span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 pt-1">
                <NeoButton
                  tone={i === 0 ? 'ink' : 'sun'}
                  size="lg"
                  className="w-full"
                  onClick={i === 0 ? onShare : onBrowse}
                >
                  {i === 0 && <Plus className="size-5" strokeWidth={3} />}
                  {p.cta}
                  {i === 1 && <ArrowRight className="size-5" strokeWidth={3} />}
                </NeoButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="grid items-center gap-6 rounded-[32px] border-2 border-dashed border-ink bg-paper p-6 sm:grid-cols-[220px_1fr] sm:p-8">
      <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-3xl border-2 border-ink bg-cream shadow-neo">
        <Image
          src="/illustrations/empty-seat.png"
          alt="A smiling daisy sitting on an empty seat"
          fill
          sizes="220px"
          className="object-cover"
        />
      </div>
      <div className="text-center sm:text-left">
        <h3 className="font-display-tight text-3xl font-black">{title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/75">{body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">{children}</div>
      </div>
    </div>
  )
}
