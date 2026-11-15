'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'
import type { LegalKey } from '@/lib/legal-content'
import { cn } from '@/lib/utils'
import { LegalDialog } from './legal-dialog'

const linkClass =
  'font-bold underline decoration-2 underline-offset-4 outline-none hover:bg-sun focus-visible:ring-4 focus-visible:ring-ink/30 rounded-sm'

/**
 * The mandatory consent checkbox for registration.
 * Controlled: the parent owns `checked` and disables "Create account" until it is true.
 */
export function LegalConsent({
  checked,
  onCheckedChange,
  invalid = false,
  id = 'legal-consent',
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** true after a blocked submit attempt: shows the red state */
  invalid?: boolean
  id?: string
}) {
  const [open, setOpen] = useState(false)
  const [docKey, setDocKey] = useState<LegalKey>('terms')

  const show = (key: LegalKey) => {
    setDocKey(key)
    setOpen(true)
  }

  return (
    <>
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3.5 transition-colors',
          checked ? 'border-ink bg-mint/25' : invalid ? 'border-[#b3261e] bg-[#fdecea]/60' : 'border-dashed border-ink/30',
        )}
      >
        <span className="relative mt-0.5 grid size-6 flex-none place-items-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            aria-invalid={invalid && !checked}
            className="peer size-6 cursor-pointer appearance-none rounded-lg border-2 border-ink bg-cream outline-none checked:bg-sun focus-visible:ring-4 focus-visible:ring-ink/30"
          />
          <Check
            className="pointer-events-none absolute size-4 text-[#141414] opacity-0 peer-checked:opacity-100"
            strokeWidth={4}
            aria-hidden="true"
          />
        </span>
        <span className="text-[13px] leading-relaxed">
          I agree to the Splitza{' '}
          <button type="button" className={linkClass} onClick={() => show('terms')}>
            Terms of Service
          </button>
          ,{' '}
          <button type="button" className={linkClass} onClick={() => show('privacy')}>
            Privacy Policy
          </button>
          , and explicitly declare that my shared pools comply with third-party platform guidelines.
        </span>
      </label>

      {!checked && (
        <p
          aria-live="polite"
          className={cn('mt-2 text-xs', invalid ? 'font-bold text-[#b3261e]' : 'text-ink/60')}
        >
          {invalid ? 'You must accept the terms to create an account.' : 'Tick the box above to enable “Create account”.'}
        </p>
      )}

      <LegalDialog open={open} onOpenChange={setOpen} docKey={docKey} onDocChange={setDocKey} />
    </>
  )
}
