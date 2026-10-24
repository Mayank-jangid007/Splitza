'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
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

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery('')
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/50 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l-2 border-foreground bg-background outline-none transition-transform duration-300 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="flex items-start justify-between gap-4 border-b-2 border-foreground bg-sun p-5">
            <div>
              <MonoLabel>All pools</MonoLabel>
              <Dialog.Title className="mt-1.5 text-3xl font-extrabold tracking-tight">
                Every shared plan
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm font-semibold text-foreground/75">
                {pools.length} pools across hosted and joined plans.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close all pools"
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-white shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
                neoFocus,
              )}
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
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
                <PoolCard pool={pool} onSelect={onSelectPool} index={index} />
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
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
