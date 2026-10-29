'use client'

import { useState } from 'react'
import { ArrowRight, Flag, Key, ShieldCheck } from 'lucide-react'
import type { EscrowPool } from './types'

interface EscrowDashboardProps {
  pool: EscrowPool
  onViewCredentials: () => void
}

export function EscrowDashboard({ pool, onViewCredentials }: EscrowDashboardProps) {
  const [opened, setOpened] = useState(false)
  const [reported, setReported] = useState(false)

  const stats: [string, string][] = [
    ['Your split', pool.split],
    ['Escrow', 'Active'],
    ['Host payout', 'In 7 days'],
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Pool card */}
      <section
        aria-label={`${pool.name} pool`}
        className="flex flex-col gap-5 rounded-[28px] border-2 border-[#151515] bg-white p-5 shadow-[4px_4px_0_0_#151515]"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-[#151515] bg-[#8de89a] text-xl font-extrabold shadow-[2px_2px_0_0_#151515]">
            {pool.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pool.logoUrl} alt="" className="size-8 object-contain" />
            ) : (
              pool.name.charAt(0)
            )}
          </span>
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold tracking-tight">{pool.name}</h2>
            <p className="text-sm font-semibold text-[#3d3a32]">Seat {pool.seatNo} · Hosted by {pool.host}</p>
          </div>
        </div>

        <dl className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {stats.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 rounded-[18px] border-2 border-[#151515] bg-[#fbf6ee] px-3.5 py-3 shadow-[2px_2px_0_0_#151515]">
              <dt className="text-xs font-extrabold uppercase tracking-wider text-[#3d3a32]">{k}</dt>
              <dd className="font-mono text-base font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => { setOpened(true); setReported(false) }}
            className="flex flex-[2_1_260px] items-center justify-center gap-2 rounded-full border-2 border-[#151515] bg-[#151515] px-5 py-3 font-extrabold text-[#fbf6ee] shadow-[3px_3px_0_0_#3d3a32] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#3d3a32]"
          >
            Open {pool.name}
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={onViewCredentials}
            className="flex flex-[1_1_180px] items-center justify-center gap-2 rounded-full border-2 border-[#151515] bg-white px-5 py-3 font-extrabold shadow-[3px_3px_0_0_#151515] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#151515]"
          >
            <Key className="size-4" />
            View credentials
          </button>
        </div>

        {opened && (
          <p role="status" aria-live="polite" className="text-sm font-bold">
            Opening {pool.name} with your credentials… (demo: no real link)
          </p>
        )}
      </section>

      {/* Escrow protection card */}
      <section
        aria-label="Escrow protection"
        className="flex flex-col gap-5 rounded-[28px] border-2 border-[#151515] bg-[#f7c85a] p-5 shadow-[4px_4px_0_0_#151515]"
      >
        <div className="flex items-start gap-3.5">
          <ShieldCheck className="mt-px size-7 shrink-0" />
          <p className="text-base font-semibold leading-normal">
            <strong className="font-extrabold">Protected:</strong> Payout transfers to the host in 7 days.
            If your access stops working before then, click "Report Issue" below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setReported(true); setOpened(false) }}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#151515] bg-white px-5 py-3 font-extrabold shadow-[3px_3px_0_0_#151515] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#151515]"
        >
          <Flag className="size-4" />
          Report Issue
        </button>
        {reported && (
          <p role="status" aria-live="polite" className="text-sm font-bold">
            Report sent. The host and Splitza support have been notified.
          </p>
        )}
      </section>
    </div>
  )
}
