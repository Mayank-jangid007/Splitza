'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BorderBeam } from '@/components/ui/border-beam'
import { POOLS } from '@/lib/pools'

const ACTIVITY = [
  { who: 'Kabir', poolId: 'netflix-4k', when: 'just now' },
  { who: 'Ananya', poolId: 'spotify-family', when: '2 min ago' },
  { who: 'Rohan', poolId: 'netflix-4k', when: '6 min ago' },
  { who: 'Meera', poolId: 'spotify-family', when: '11 min ago' },
]

const feed = ACTIVITY.flatMap((item) => {
  const pool = POOLS.find((p) => p.id === item.poolId)
  return pool ? [{ ...item, pool }] : []
})

export function HeroBanner() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || feed.length < 2) return
    const timer = window.setInterval(() => setIndex((c) => (c + 1) % feed.length), 3200)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  const current = feed[index]
  if (!current) return null

  return (
    <section aria-label="Live marketplace activity" className="brut relative overflow-hidden rounded-full bg-ink text-cream">
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -left-8 size-36 rounded-full bg-bubble/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -bottom-12 size-40 rounded-full bg-sun/50 blur-3xl" />
      <div className="relative flex items-center gap-4 py-3 pr-3 pl-5 sm:pl-6">
        <span className="flex shrink-0 items-center gap-2 font-mono text-xs font-bold tracking-[0.18em] text-mint uppercase">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-mint" />
          </span>
          Live
        </span>
        <div className="relative h-10 min-w-0 flex-1 overflow-hidden" aria-live="off">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={index}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center gap-2.5 text-sm sm:text-base"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.pool.logo} alt="" className="size-4 object-contain" />
              </span>
              <span className="truncate">
                <strong className="font-extrabold text-sun">{current.who}</strong>{' '}
                grabbed a seat in{' '}
                <strong className="font-extrabold">{current.pool.name}</strong>
                <span className="hidden font-mono text-xs text-cream/60 sm:inline">{'  '}· {current.when}</span>
              </span>
            </motion.p>
          </AnimatePresence>
        </div>
        <ul className="hidden shrink-0 items-center pr-1 sm:flex" aria-hidden="true">
          {POOLS.slice(0, 5).map((pool, i) => (
            <li key={pool.id} className="grid size-9 place-items-center rounded-full border-2 border-ink bg-white" style={{ marginLeft: i === 0 ? 0 : -10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pool.logo} alt="" className="size-5 object-contain" />
            </li>
          ))}
        </ul>
      </div>
      <BorderBeam size={140} duration={7} borderWidth={2} colorFrom="#f7c85a" colorTo="#f28fe0" />
    </section>
  )
}
