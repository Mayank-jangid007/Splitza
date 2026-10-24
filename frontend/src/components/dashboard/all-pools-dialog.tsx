'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { Pool } from '@/lib/dashboard/types'
import { matchesQuery } from '@/lib/dashboard/pool-utils'
import { neoFocus } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'
import { PoolCard } from './pool-card'
import { PoolSearch } from './pool-search'
import { MonoLabel } from './tag'

interface AllPoolsDialogProps {
  open: boolean
  pools: Pool[]
  onOpenChange: (open: boolean) => void
  onSelectPool: (pool: Pool) => void
}

export function AllPoolsDialog({
  open,
  pools,
  onOpenChange,
  onSelectPool,
}: AllPoolsDialogProps) {
  const [query, setQuery] = useState('')
  const visible = pools.filter((pool) => matchesQuery(pool, query))
  const closeRef = useRef<HTMLButtonElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange])

  // Lock scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      setQuery('')
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/50"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="All pools"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l-2 border-foreground bg-background outline-none"
          >
            <div className="flex items-start justify-between gap-4 border-b-2 border-foreground bg-sun p-5">
              <div>
                <MonoLabel>All pools</MonoLabel>
                <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight">
                  Every shared plan
                </h2>
                <p className="mt-1 text-sm font-semibold text-foreground/75">
                  {pools.length} pools across hosted and joined plans.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close all pools"
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-white shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
                  neoFocus,
                )}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="border-b-2 border-foreground p-5">
              <PoolSearch
                value={query}
                onChange={setQuery}
                placeholder="Filter by pool or host..."
                label="Filter all pools"
              />
            </div>

            <ul className="flex-1 space-y-5 overflow-y-auto p-5">
              {visible.map((pool, index) => (
                <li key={pool.id}>
                  <PoolCard
                    pool={pool}
                    onSelect={(p) => {
                      onOpenChange(false)
                      onSelectPool(p)
                    }}
                    index={index}
                  />
                </li>
              ))}
              {visible.length === 0 && (
                <li
                  role="status"
                  className="py-12 text-center font-semibold text-foreground/75"
                >
                  No pools match &ldquo;{query}&rdquo;.
                </li>
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
