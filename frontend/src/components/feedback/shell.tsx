import type { CSSProperties } from 'react'

export const INK = '#151515'

export const box = 'border-[2.5px] border-[#151515] shadow-[4px_4px_0_0_#151515]'
export const boxSm = 'border-[2.5px] border-[#151515] shadow-[3px_3px_0_0_#151515]'
export const press =
  'transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#151515] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'

export const mono: CSSProperties = { fontFamily: 'var(--font-space-mono), ui-monospace, monospace' }

export const field =
  'h-[52px] w-full rounded-2xl border-[3px] border-[#151515] bg-white px-4 text-base font-semibold outline-none focus:bg-[#fffdf4] focus:shadow-[4px_4px_0_0_#151515]'

export const fieldBad =
  'border-[#c2261a] shadow-[4px_4px_0_0_#c2261a] focus:shadow-[4px_4px_0_0_#c2261a]'

export const pastelBtn =
  'inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-[#151515] bg-[#a4ecb0] font-extrabold shadow-[4px_4px_0_0_#151515] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#151515] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-wait disabled:opacity-60'

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="w-fit rounded-full border-2 border-[#151515] bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
      style={mono}
    >
      {children}
    </span>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen pb-20 text-[#151515]"
      style={{
        fontFamily: 'var(--font-bricolage), system-ui, sans-serif',
        backgroundColor: '#fbf6ee',
        backgroundImage: 'radial-gradient(rgba(21,21,21,.15) 1.3px, transparent 1.4px)',
        backgroundSize: '26px 26px',
      }}
    >
      <header className="mx-auto flex max-w-[1100px] items-center justify-start px-4 pt-5 sm:px-8">
        <a
          href="/dashboard"
          className={`flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-extrabold ${boxSm} ${press}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to dashboard
        </a>
      </header>
      <main className="mx-auto max-w-[1100px] px-4 pt-2 sm:px-8">{children}</main>
    </div>
  )
}
