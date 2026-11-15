'use client'

import { LEGAL_DOCS, LEGAL_ORDER, type LegalKey } from '@/lib/legal-content'
import { cn } from '@/lib/utils'
import { NeoDialog } from '@/components/splitza/ui'
import { LegalDocument } from './legal-document'

/**
 * Policy dialog with tabs. Tabs stay fixed (flex-none); only the text area scrolls.
 * `docKey` decides which tab is open: clicking "Terms of Service" opens the terms tab, etc.
 */
export function LegalDialog({
  open,
  onOpenChange,
  docKey,
  onDocChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  docKey: LegalKey
  onDocChange: (key: LegalKey) => void
}) {
  const doc = LEGAL_DOCS[docKey]
  return (
    <NeoDialog open={open} onOpenChange={onOpenChange} eyebrow="Legal" title={doc.title} accent="bg-sun" maxWidth="max-w-2xl">
      <div role="tablist" aria-label="Policies" className="-mx-1 mb-4 flex flex-none gap-2 overflow-x-auto px-1 pb-1">
        {LEGAL_ORDER.map((k) => {
          const active = k === docKey
          return (
            <button
              key={k}
              type="button"
              role="tab"
              id={`legal-tab-${k}`}
              aria-selected={active}
              aria-controls="legal-panel"
              onClick={() => onDocChange(k)}
              className={cn(
                'h-9 flex-none whitespace-nowrap rounded-full border-2 border-ink px-3.5 text-xs font-bold outline-none focus-visible:ring-4 focus-visible:ring-ink/30',
                active ? 'bg-ink text-paper' : 'bg-paper',
              )}
            >
              {LEGAL_DOCS[k].tab}
            </button>
          )
        })}
      </div>
      <div
        id="legal-panel"
        role="tabpanel"
        aria-labelledby={`legal-tab-${docKey}`}
        tabIndex={0}
        key={docKey}
        className="max-h-[min(55vh,480px)] overflow-y-auto overscroll-contain rounded-2xl border-2 border-ink bg-paper p-4 outline-none focus-visible:ring-4 focus-visible:ring-ink/30"
      >
        <LegalDocument doc={doc} />
      </div>
    </NeoDialog>
  )
}
