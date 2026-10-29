'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Lock, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EscrowPool } from './types'

const HANDLES = ['@okaxis', '@oksbi', '@ybl', '@paytm', '@upi']
const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/

interface PayFormProps {
  pool: EscrowPool
  onPaid: (upiId: string) => void
}

export function PayForm({ pool, onPaid }: PayFormProps) {
  const [upi, setUpi] = useState('')
  const [touched, setTouched] = useState(false)
  const [paying, setPaying] = useState(false)

  const invalid = touched && !UPI_RE.test(upi.trim())

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!UPI_RE.test(upi.trim()) || paying) return
    setPaying(true)
    // TODO: replace with real Razorpay order + server-side verification
    setTimeout(() => onPaid(upi.trim()), 2000)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="upi-input" className="text-sm font-extrabold text-[#151515]">
          Your UPI ID
        </label>
        <input
          id="upi-input"
          type="text"
          inputMode="email"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          placeholder="yourname@okaxis"
          value={upi}
          disabled={paying}
          onChange={(e) => { setUpi(e.target.value); if (touched) setTouched(false) }}
          onBlur={() => setTouched(true)}
          aria-invalid={invalid}
          aria-describedby="upi-help"
          className={cn(
            'h-14 w-full rounded-full border-[2.5px] border-[#151515] bg-white px-[22px] font-mono text-base font-bold text-[#151515] shadow-[3px_3px_0_0_#151515] outline-none outline-offset-[3px] transition-[box-shadow] focus-visible:outline-2 focus-visible:outline-[#151515]',
            invalid && 'border-[#b42318] shadow-[3px_3px_0_0_#b42318]',
            paying && 'opacity-60',
          )}
        />
        <p
          id="upi-help"
          role={invalid ? 'alert' : 'note'}
          className={cn('text-[13px] font-bold', invalid ? 'text-[#b42318]' : 'text-[#2b2a25]')}
        >
          {invalid
            ? 'Enter a valid UPI ID, like name@okaxis.'
            : 'Tap a handle to finish your ID faster.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {HANDLES.map((h) => (
            <button
              key={h}
              type="button"
              disabled={paying}
              onClick={() => setUpi(upi.split('@')[0] + h)}
              className="rounded-full border-2 border-[#151515] bg-white px-4 py-1.5 font-mono text-[13px] font-bold shadow-[2px_2px_0_0_#151515] transition-colors hover:bg-[#f7c85a] disabled:opacity-50"
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={paying}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-[#151515] bg-[#151515] px-6 font-extrabold text-[#fbf6ee] shadow-[3px_3px_0_0_#3d3a32] transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#3d3a32] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-wait disabled:opacity-80"
        >
          {paying ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Approve the request in your UPI app
            </>
          ) : (
            <>
              <Lock className="size-5" />
              Pay {pool.amount} securely
            </>
          )}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-[#2b2a25]">
          <Shield className="size-4 shrink-0" />
          {/* DEMO: real payment via Razorpay server-side verification is a TODO */}
          Powered by Razorpay. The host is paid only after the 7-day protection window.
        </p>
      </div>
    </form>
  )
}
