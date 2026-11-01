'use client'

import { Check, Lock, Plus } from 'lucide-react'
import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { pricePerSeat, rupee } from '@/lib/splitza'
import { Burst, Flower, Sparkle } from './stickers'
import { Avatar, PlatformLogo } from './ui'

const MONTHLY = 649
const SEAT_NAMES = ['You', 'Aarav', 'Meera', 'Kabir']

const CROSS_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'%3E%3Cpath d='M11 6v10M6 11h10' stroke='%23151515' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E")`

function Layer({
  depth,
  className,
  children,
}: {
  depth: number
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn('absolute transition-transform duration-200 ease-out will-change-transform', className)}
      style={{
        transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth}px), 0)`,
      }}
    >
      {children}
    </div>
  )
}

function MiniPlanCard({ name, price, className }: { name: string; price: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex w-40 items-center gap-2.5 rounded-2xl border-2 border-ink bg-paper p-2.5 shadow-neo sm:w-48',
        className,
      )}
    >
      <PlatformLogo name={name} size={38} />
      <div className="min-w-0">
        <p className="truncate font-display text-[11px] font-black leading-tight">{name}</p>
        <p className="mt-0.5 text-[11px] font-bold">{price}</p>
      </div>
    </div>
  )
}

function EscrowVault() {
  return (
    <div className="relative grid size-24 place-items-center sm:size-28">
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="animate-spin-slow absolute inset-0 size-full"
      >
        <defs>
          <path id="vault-ring" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="#151515" />
        <text fill="#fbf6ee" fontSize="10.5" fontWeight="800" letterSpacing="3.2" fontFamily="var(--font-jetbrains), monospace">
          <textPath href="#vault-ring">ESCROW • HELD SAFE • ESCROW • HELD SAFE •</textPath>
        </text>
      </svg>
      <span className="relative grid size-12 place-items-center rounded-full border-2 border-ink bg-mint sm:size-14">
        <Lock className="size-5 sm:size-6" strokeWidth={3} />
      </span>
    </div>
  )
}

export function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const noteSeq = useRef(0)
  const [seats, setSeats] = useState([true, false, false, false])
  const [note, setNote] = useState<{ id: number; text: string } | null>(null)

  const filled = seats.filter(Boolean).length
  const perSeat = pricePerSeat(MONTHLY, filled, 1)
  const savings = Math.round((1 - perSeat / MONTHLY) * 100)

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    const el = stageRef.current
    if (!el || e.pointerType === 'touch') return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', String(((e.clientX - rect.left) / rect.width - 0.5) * 2))
    el.style.setProperty('--my', String(((e.clientY - rect.top) / rect.height - 0.5) * 2))
  }

  function handleLeave() {
    stageRef.current?.style.setProperty('--mx', '0')
    stageRef.current?.style.setProperty('--my', '0')
  }

  function toggleSeat(index: number) {
    if (index === 0) return
    const next = seats.map((s, i) => (i === index ? !s : s))
    const nextCount = next.filter(Boolean).length
    setSeats(next)
    noteSeq.current += 1
    setNote({
      id: noteSeq.current,
      text: next[index]
        ? `${SEAT_NAMES[index]} paid ${rupee(pricePerSeat(MONTHLY, nextCount, 1))} → escrow`
        : `${SEAT_NAMES[index]} left the pool`,
    })
  }

  return (
    <div
      ref={stageRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      role="group"
      aria-label="Interactive demo: tap seats to split a Netflix plan"
      className="relative h-[510px] w-full sm:h-[550px]"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[32px] border-2 border-ink bg-lav shadow-neo-lg">
        <div className="dots-bg absolute inset-0 opacity-50" />
        <div className="absolute -bottom-24 -right-20 size-72 rounded-full border-2 border-ink bg-sky" />
        <div
          className="absolute -left-20 -top-20 size-64 rounded-full opacity-90"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at center, transparent 0 14px, #151515 14px 16px)',
          }}
        />
        <div className="stripes-bg absolute right-0 top-0 h-full w-7 border-l-2 border-ink bg-sun" />
        <div
          className="absolute bottom-6 left-5 h-24 w-32 opacity-80"
          style={{ backgroundImage: CROSS_PATTERN, backgroundSize: '22px 22px' }}
        />
      </div>

      <Layer depth={-10} className="right-10 top-6 z-[1] rotate-6 sm:right-12">
        <MiniPlanCard name="Spotify Family" price={`${rupee(36)} / seat`} />
      </Layer>
      <Layer depth={-14} className="bottom-7 left-4 z-[1] -rotate-6">
        <MiniPlanCard name="Google One" price={`${rupee(49)} / seat`} />
      </Layer>

      <Layer depth={14} className="left-3 top-4 z-[3] sm:left-4">
        <EscrowVault />
      </Layer>

      <Layer depth={8} className="left-1/2 top-1/2 z-[2] w-[min(84%,296px)] -translate-x-1/2 -translate-y-[46%]">
        <div className="-rotate-1 rounded-3xl border-2 border-ink bg-paper p-4 shadow-neo-lg">
          <div className="flex items-center gap-3">
            <PlatformLogo name="Netflix" size={46} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-black leading-tight">Netflix Premium</p>
              <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">{rupee(MONTHLY)} / month</p>
            </div>
            <span className="rounded-full border-2 border-ink bg-sky px-2 py-0.5 text-[10px] font-bold uppercase">
              Public
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-1.5">
            {seats.map((taken, i) => (
              <button
                key={SEAT_NAMES[i]}
                type="button"
                onClick={() => toggleSeat(i)}
                aria-pressed={taken}
                aria-label={
                  i === 0
                    ? 'Your seat (host)'
                    : taken
                      ? `${SEAT_NAMES[i]} joined. Tap to remove`
                      : `Empty seat ${i + 1}. Tap to fill`
                }
                className={cn(
                  'grid size-[52px] place-items-center rounded-full outline-offset-2 transition-transform focus-visible:outline-2 focus-visible:outline-ink',
                  i !== 0 && 'hover:-translate-y-1 active:translate-y-0.5',
                  i === 0 && 'cursor-default',
                )}
              >
                {taken ? (
                  <Avatar name={SEAT_NAMES[i] === 'You' ? 'You' : SEAT_NAMES[i]} index={[2, 1, 3, 4][i]} size={50} className="shadow-neo-sm" />
                ) : (
                  <span className="grid size-[50px] place-items-center rounded-full border-2 border-dashed border-ink bg-cream">
                    <Plus className="size-5" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {seats.map((taken, i) => (
              <span
                key={i}
                className={cn(
                  'h-2.5 flex-1 rounded-full border-2 border-ink transition-colors duration-300',
                  taken ? 'bg-sun' : 'bg-cream',
                )}
              />
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between gap-2 border-t-2 border-dashed border-ink pt-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Each pays</p>
              <p className="font-display-tight text-3xl font-black" aria-live="polite">
                {rupee(perSeat)}
              </p>
            </div>
            <span
              className={cn(
                'mb-1 rounded-full border-2 border-ink px-2.5 py-1 text-[11px] font-black transition-colors',
                savings > 0 ? 'bg-mint' : 'bg-cream',
              )}
            >
              {savings > 0 ? `Save ${savings}%` : 'Just you'}
            </span>
          </div>

          <div className="mt-3 flex h-8 items-center">
            {note ? (
              <span
                key={note.id}
                className="animate-pop inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-3 py-1 text-[11px] font-bold text-paper"
              >
                <Check className="size-3.5" strokeWidth={3.5} />
                {note.text}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-muted-foreground">Tap an empty seat to split it</span>
            )}
          </div>
        </div>
      </Layer>

      <Layer depth={-18} className="bottom-24 right-5 z-[3] hidden sm:block">
        <span className="animate-float grid size-14 place-items-center rounded-full border-2 border-ink bg-sun font-display text-xl font-black shadow-neo [--r:-8deg]">
          ₹
        </span>
      </Layer>
      <Layer depth={-20} className="bottom-10 right-16 z-[3]">
        <span className="animate-float grid size-9 place-items-center rounded-full border-2 border-ink bg-mint font-display text-sm font-black shadow-neo-sm [--r:10deg]">
          ₹
        </span>
      </Layer>

      <Sparkle className="animate-float absolute -left-5 top-[46%] z-[4] size-10" fill="#f8d56b" />
      <Burst className="animate-spin-slow absolute -right-5 top-10 z-[4] size-14" fill="#ffb59a" />
      <Flower className="animate-spin-slow absolute -bottom-6 -left-6 z-[4] size-20" fill="#a9c7f7" face />
    </div>
  )
}
