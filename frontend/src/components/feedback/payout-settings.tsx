'use client'

import { useId, useState, type FormEvent } from 'react'
import { BadgeCheck, Building2, Lock } from 'lucide-react'

const UPI_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
const HANDLES = ['@oksbi', '@okhdfcbank', '@okaxis', '@ybl', '@paytm']

const mono = { fontFamily: 'var(--font-space-mono), ui-monospace, monospace' }
const label = 'mb-2 block text-[13px] font-extrabold'
const input =
  'h-[52px] w-full rounded-2xl border-[3px] border-[#151515] bg-white pl-4 pr-14 text-base font-bold outline-none transition-shadow focus:bg-[#fffdf4] focus:shadow-[4px_4px_0_0_#151515]'
const btn =
  'inline-flex items-center justify-center rounded-full border-[3px] border-[#151515] font-extrabold shadow-[3px_3px_0_0_#151515] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#151515] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-60'

type Props = {
  /** UPI currently on file. Empty string = nothing saved yet (form opens directly). */
  initialUpi?: string
  /** Persist the new UPI (e.g. call your API / Razorpay Route linked-account update). Throw to show an error. */
  onSave?: (upi: string) => Promise<void> | void
  /** Called after a successful save, e.g. to show a toast. */
  onSaved?: (upi: string) => void
}

export function PayoutSettings({ initialUpi = '', onSave, onSaved }: Props) {
  const uid = useId()
  const [savedUpi, setSavedUpi] = useState(initialUpi)
  const [editing, setEditing] = useState(false)
  const [upi, setUpi] = useState('')
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  const locked = !!savedUpi && !editing
  const valid = UPI_RE.test(upi)
  const error =
    serverError ||
    (touched && !valid
      ? upi
        ? 'Enter a valid UPI ID, like name@okaxis.'
        : 'UPI ID is required to receive earnings.'
      : '')

  function startEdit() {
    setUpi(savedUpi)
    setTouched(false)
    setServerError('')
    setEditing(true)
  }

  function cancel() {
    setEditing(false)
    setUpi(savedUpi)
    setTouched(false)
    setServerError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    setSaving(true)
    setServerError('')
    try {
      await onSave?.(upi)
      setSavedUpi(upi)
      setEditing(false)
      onSaved?.(upi)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="flex flex-col rounded-[28px] border-[2.5px] border-[#151515] bg-[#f8d56b] p-[22px] shadow-[5px_5px_0_0_#151515] sm:p-7"
    >
      {/* header */}
      <div className="mb-5 flex items-center gap-3 border-b-[3px] border-dashed border-[#151515]/30 pb-4">
        <span className="grid size-11 flex-none place-items-center rounded-[14px] border-[2.5px] border-[#151515] bg-white">
          <Building2 className="size-[22px]" strokeWidth={2.6} aria-hidden="true" />
        </span>
        <div>
          <h2 id={`${uid}-title`} className="text-sm font-extrabold uppercase tracking-[.07em]">
            Payout receiving settings
          </h2>
          <span className="text-[11px] font-bold" style={mono}>
            FOR HOSTS
          </span>
        </div>
      </div>

      {locked ? (
        /* LOCKED: shows the saved UPI, Edit unlocks it */
        <div>
          <span className={label}>Your UPI ID for earnings</span>
          <div className="flex items-center gap-3 rounded-2xl border-[3px] border-[#151515] bg-white p-3.5">
            <span className="grid size-[42px] flex-none place-items-center rounded-xl border-[2.5px] border-[#151515] bg-[#a9c7f7]">
              <Lock className="size-5" strokeWidth={2.6} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <b className="block break-all text-base" style={mono}>
                {savedUpi}
              </b>
              <span
                className="mt-1.5 inline-block rounded-full border-2 border-[#151515] bg-[#a4ecb0] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                style={mono}
              >
                Verified · Locked
              </span>
            </div>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-[#6b6558]">
            This UPI is locked so your payouts stay safe. Tap Edit if you need to change it.
          </p>
          <button
            type="button"
            onClick={startEdit}
            className={`${btn} mt-4 h-[50px] w-full bg-white text-[15px]`}
          >
            Edit UPI ID
          </button>
        </div>
      ) : (
        /* EDITING / FIRST TIME */
        <form onSubmit={submit} noValidate>
          <label htmlFor={`${uid}-upi`} className={label}>
            Your UPI ID for earnings
          </label>
          <div className="relative">
            <input
              id={`${uid}-upi`}
              autoFocus={editing}
              onFocus={(e) => editing && e.currentTarget.select()}
              value={upi}
              onChange={(e) => setUpi(e.target.value.replace(/\s/g, ''))}
              onBlur={() => setTouched(true)}
              placeholder="username@okaxis"
              autoComplete="off"
              spellCheck={false}
              inputMode="email"
              aria-invalid={!!error}
              aria-describedby={`${uid}-err`}
              className={`${input} ${error ? 'border-[#c2261a] shadow-[4px_4px_0_0_#c2261a]' : ''}`}
            />
            {valid && (
              <BadgeCheck
                className="absolute right-3 top-3 size-7 fill-[#a4ecb0]"
                strokeWidth={2.4}
                aria-label="Valid UPI ID"
              />
            )}
          </div>
          <p
            id={`${uid}-err`}
            role="alert"
            className="mt-1.5 min-h-4 text-xs font-extrabold text-[#c2261a]"
          >
            {error}
          </p>
          <p className="text-xs font-semibold text-[#6b6558]">
            Format: name@bank. Use the UPI linked to your bank account.
          </p>

          <div className="mt-3 flex flex-wrap gap-2" aria-label="Common UPI handles">
            {HANDLES.map((h) => (
              <button
                key={h}
                type="button"
                style={mono}
                onClick={() => {
                  setUpi(`${upi.split('@')[0]}${h}`)
                  setTouched(true)
                }}
                className="rounded-full border-[2.5px] border-[#151515] bg-white px-3 py-[5px] text-[13px] font-extrabold hover:bg-[#fbf6ee]"
              >
                {h}
              </button>
            ))}
          </div>

          <div className="mt-5 flex gap-2.5">
            {savedUpi && (
              <button
                type="button"
                onClick={cancel}
                className={`${btn} h-[54px] bg-white px-6 text-base`}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`${btn} h-[54px] flex-1 bg-[#a4ecb0] text-base`}
            >
              {saving ? 'Saving…' : 'Save payout ID'}
            </button>
          </div>
        </form>
      )}

      {/* routing status */}
      <div className="mt-5 flex items-center gap-3 rounded-[18px] border-[3px] border-[#151515] bg-white px-3.5 py-3">
        <span
          className="size-3.5 flex-none animate-pulse rounded-full border-[2.5px] border-[#151515] bg-[#16a34a]"
          aria-hidden="true"
        />
        <div>
          <b className="block text-sm">⚡ Weekly Razorpay routing active</b>
          <span className="text-xs font-semibold text-[#4a463d]">
            Earnings go straight to this UPI&apos;s bank account every week.
          </span>
        </div>
      </div>
    </section>
  )
}
