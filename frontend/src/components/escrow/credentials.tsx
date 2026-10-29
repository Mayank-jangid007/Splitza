'use client'

import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Key } from 'lucide-react'
import type { EscrowPool } from './types'
import { CopyBtn } from './copy-btn'

interface CredentialRowProps {
  label: string
  value: string
  last?: boolean
  children?: React.ReactNode
}

function CredentialRow({ label, value, last, children }: CredentialRowProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 py-3 ${last ? '' : 'border-b-2 border-dashed border-[#151515]/25'}`}>
      <span className="w-24 shrink-0 text-xs font-extrabold uppercase tracking-wider text-[#3d3a32]">{label}</span>
      <span className="min-w-0 flex-1 font-mono text-[15px] font-bold [overflow-wrap:anywhere]">{value}</span>
      {children}
    </div>
  )
}

interface CredentialsProps {
  pool: EscrowPool
  onDashboard: () => void
}

export function Credentials({ pool, onDashboard }: CredentialsProps) {
  const [showPass, setShowPass] = useState(false)
  const [opened, setOpened] = useState(false)

  return (
    <section
      aria-label="Your access credentials"
      className="flex flex-col gap-5 rounded-[28px] border-2 border-[#151515] bg-[#8de89a] p-5 shadow-[4px_4px_0_0_#151515]"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#151515] bg-white shadow-[2px_2px_0_0_#151515]">
          <Key className="size-6" />
        </span>
        <div className="flex flex-col">
          <h2 className="text-xl font-extrabold tracking-tight">Your {pool.name} access</h2>
          <p className="text-sm font-semibold text-[#3d3a32]">{pool.name} · Seat {pool.seatNo}</p>
        </div>
      </div>

      {/* Credentials table */}
      <div className="flex flex-col rounded-[20px] border-2 border-[#151515] bg-white px-4 py-1.5 shadow-[3px_3px_0_0_#151515]">
        <CredentialRow label="Username" value={pool.username}>
          <CopyBtn value={pool.username} label="Copy username" />
        </CredentialRow>
        <CredentialRow label="Password" value={showPass ? pool.password : '•'.repeat(12)}>
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            aria-label={showPass ? 'Hide password' : 'Show password'}
            className="grid size-10 place-items-center rounded-full border-2 border-[#151515] bg-white shadow-[2px_2px_0_0_#151515] transition-colors hover:bg-[#f7c85a]"
          >
            {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
          <CopyBtn value={pool.password} label="Copy password" />
        </CredentialRow>
        <CredentialRow label="Profile" value={`Seat ${pool.seatNo} · PIN ${pool.pin}`} last>
          <CopyBtn value={pool.pin} label="Copy PIN" />
        </CredentialRow>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setOpened(true)}
          className="flex flex-[2_1_260px] items-center justify-center gap-2 rounded-full border-2 border-[#151515] bg-[#151515] px-5 py-3 font-extrabold text-[#fbf6ee] shadow-[3px_3px_0_0_#3d3a32] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#3d3a32]"
        >
          Open {pool.name}
          <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDashboard}
          className="flex flex-[1_1_180px] items-center justify-center gap-2 rounded-full border-2 border-[#151515] bg-white px-5 py-3 font-extrabold shadow-[3px_3px_0_0_#151515] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#151515]"
        >
          Go to dashboard
          <ArrowRight className="size-4" strokeWidth={2.6} />
        </button>
      </div>

      {opened && (
        <p role="status" aria-live="polite" className="text-sm font-bold">
          Opening {pool.name} with your credentials… (demo: no real link)
        </p>
      )}
    </section>
  )
}
