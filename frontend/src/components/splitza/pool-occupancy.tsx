import { Crown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pool } from '@/lib/pools'

const MEMBER_NAMES = ['Ananya', 'Rahul', 'Sneha', 'Aditya', 'Priya', 'Manav', 'Kavya', 'Nikhil', 'Zoya', 'Tara']
const MEMBER_TONES = ['bg-bubble', 'bg-mint', 'bg-lilac', 'bg-sky', 'bg-peach']

type Seat =
  | { kind: 'host'; label: string }
  | { kind: 'member'; label: string; tone: string }
  | { kind: 'you'; label: string }
  | { kind: 'open' }

function buildSeats(pool: Pool, seatsLeft: number, joined: boolean): Seat[] {
  const filled = pool.totalSeats - seatsLeft
  const seed = Array.from(pool.id).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const memberCount = Math.max(filled - 1 - (joined ? 1 : 0), 0)
  const seats: Seat[] = [{ kind: 'host', label: pool.host.split(' ')[0] }]
  for (let index = 0; index < memberCount; index++) {
    seats.push({
      kind: 'member',
      label: MEMBER_NAMES[(seed + index * 3) % MEMBER_NAMES.length],
      tone: MEMBER_TONES[(seed + index) % MEMBER_TONES.length],
    })
  }
  if (joined) seats.push({ kind: 'you', label: 'You' })
  while (seats.length < pool.totalSeats) seats.push({ kind: 'open' })
  return seats
}

export function PoolOccupancy({ pool, seatsLeft, joined }: { pool: Pool; seatsLeft: number; joined: boolean }) {
  const filled = pool.totalSeats - seatsLeft
  const seats = buildSeats(pool, seatsLeft, joined)
  const status = seatsLeft === 0 ? 'Pool is full' : seatsLeft === 1 ? 'Last seat!' : `${seatsLeft} seats open`

  return (
    <section aria-label="Seat availability" className="brut-sm flex flex-col gap-4 rounded-2xl bg-white p-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold tracking-wide text-ink/70 uppercase">Seats available</span>
          <span className="font-mono text-3xl leading-none font-bold">
            {seatsLeft}
            <span className="font-sans text-base font-semibold text-ink/60"> of {pool.totalSeats} left</span>
          </span>
        </div>
        <span className={cn('rounded-full border-2 border-ink px-3 py-1 text-xs font-bold',
          seatsLeft === 0 ? 'bg-muted' : seatsLeft === 1 ? 'bg-peach' : 'bg-sun')}>
          {status}
        </span>
      </div>
      <ul className="flex gap-2" aria-label={`${filled} of ${pool.totalSeats} seats filled`}>
        {seats.map((seat, index) => (
          <li key={index} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <SeatAvatar seat={seat} />
            <span className={cn('w-full truncate text-center text-[11px] font-semibold',
              seat.kind === 'open' ? 'text-ink/50' : 'text-ink')}>
              {seat.kind === 'open' ? 'Open' : seat.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SeatAvatar({ seat }: { seat: Seat }) {
  if (seat.kind === 'open') {
    return (
      <span className="grid size-11 place-items-center rounded-full border-2 border-dashed border-ink/60 bg-cream text-ink/50 sm:size-12">
        <Plus className="size-4" aria-hidden="true" />
      </span>
    )
  }
  const tone = seat.kind === 'host' ? 'bg-sun' : seat.kind === 'you' ? 'bg-ink text-cream' : seat.tone
  return (
    <span className={cn('relative grid size-11 place-items-center rounded-full border-2 border-ink text-base font-extrabold sm:size-12', tone)}>
      {seat.label.charAt(0)}
      {seat.kind === 'host' && (
        <span className="absolute -top-2 -right-1 grid size-5 place-items-center rounded-full border-2 border-ink bg-white">
          <Crown className="size-3" aria-hidden="true" />
          <span className="sr-only">Host</span>
        </span>
      )}
    </span>
  )
}
