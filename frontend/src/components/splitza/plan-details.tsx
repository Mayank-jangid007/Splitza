'use client'

import { useState } from 'react'

const MONO = "font-[family-name:var(--font-space-mono)]"
const SECTION = `${MONO} text-xs font-bold uppercase tracking-[0.12em] text-[#6b6558]`
const CLAMP_AT = 280

type Block = { kind: 'p' | 'li' | 'gap'; text: string; num?: string }

function parse(text: string): Block[] {
  return text
    .split('\n')
    .map((raw) => {
      const line = raw.trim()
      if (!line) return { kind: 'gap', text: '' } as Block
      const m = line.match(/^(?:([-•*])|(\d+)[.)]) +(.*)$/)
      if (m) return { kind: 'li', text: m[3], num: m[2] } as Block
      return { kind: 'p', text: line } as Block
    })
    .filter((b, i, a) => !(b.kind === 'gap' && (i === 0 || a[i - 1].kind === 'gap')))
}

interface PlanDetailsProps {
  /** Pool description + rules as plain text or with lines starting with - / 1. */
  text: string
  setBy: string
}

export function PlanDetails({ text, setBy }: PlanDetailsProps) {
  const [open, setOpen] = useState(false)
  const blocks = parse(text)
  const long = text.length > CLAMP_AT

  return (
    <section className="rounded-[28px] border-[2.5px] border-[#151515] bg-white p-5 shadow-[4px_4px_0_0_#151515]">
      <div className="flex items-center justify-between gap-3">
        <h3 className={SECTION}>Plan details</h3>
        <span className="rounded-full border-2 border-[#151515] bg-[#cdb0ea] px-3 py-1 text-xs font-bold">
          Set by {setBy}
        </span>
      </div>

      <div className="relative mt-4">
        <div
          className={`flex flex-col gap-2 text-[15px] leading-relaxed text-[#2b2923] ${
            long && !open ? 'max-h-[132px] overflow-hidden' : ''
          }`}
        >
          {blocks.length === 0 && (
            <p className="text-[#8a857a]">The host has not added any details yet.</p>
          )}
          {blocks.map((b, i) =>
            b.kind === 'gap' ? (
              <div key={i} className="h-1" />
            ) : b.kind === 'li' ? (
              <div key={i} className="flex items-start gap-3">
                {b.num ? (
                  <span className={`${MONO} mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[#151515] bg-[#f7c85a] text-[10px] font-bold`}>
                    {b.num}
                  </span>
                ) : (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full border-2 border-[#151515] bg-[#f7c85a]" />
                )}
                <p>{b.text}</p>
              </div>
            ) : (
              <p key={i} className={/:$/.test(b.text) ? 'font-extrabold text-[#151515]' : ''}>
                {b.text}
              </p>
            )
          )}
        </div>

        {long && !open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {long && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={`${MONO} mt-3 rounded-full border-2 border-[#151515] bg-[#fbf6ee] px-3 py-1.5 text-[11px] font-bold active:translate-x-px active:translate-y-px`}
        >
          {open ? 'Show less ▴' : 'Read more ▾'}
        </button>
      )}
    </section>
  )
}
