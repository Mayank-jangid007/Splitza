'use client'

import { useState, type ReactNode } from 'react'

const MONO = "font-[family-name:var(--font-space-mono)]"
const SECTION = `${MONO} text-xs font-bold uppercase tracking-[0.12em] text-[#6b6558]`
const BTN = `${MONO} rounded-full border-2 border-[#151515] px-4 py-2.5 text-xs font-bold active:translate-x-px active:translate-y-px`

function Ic({ children, s = 22 }: { children: ReactNode; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

function VisIcon({ pub, size = 20 }: { pub: boolean; size?: number }) {
  return (
    <Ic s={size}>
      {pub ? (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
        </>
      ) : (
        <>
          <rect x="4" y="11" width="16" height="10" rx="2.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      )}
    </Ic>
  )
}

// ── 1. Visibility toggle ────────────────────────────────────────
export function Visibility({ isPublic, onChange }: { isPublic: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className={SECTION}>Visibility</h3>
      <div className="flex items-center justify-between gap-4 rounded-[24px] border-[2.5px] border-[#151515] bg-white p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#151515] ${isPublic ? 'bg-[#8de89a]' : 'bg-[#f7c85a]'}`}>
            <VisIcon pub={isPublic} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-extrabold leading-tight">{isPublic ? 'Public pool' : 'Private pool'}</p>
            <p className="text-sm font-medium text-[#6b6558]">
              {isPublic ? 'Anyone can find this pool and join.' : 'Only people with your link can join.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-label="Toggle pool visibility"
          onClick={() => onChange(!isPublic)}
          className={`relative h-9 w-16 shrink-0 rounded-full border-[2.5px] border-[#151515] transition-colors ${isPublic ? 'bg-[#8de89a]' : 'bg-[#ece8de]'}`}
        >
          <span className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-[#151515] bg-white transition-all ${isPublic ? 'left-[30px]' : 'left-0.5'}`} />
        </button>
      </div>
    </div>
  )
}

// ── 2. Invite people ────────────────────────────────────────────
export function InvitePeople({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  const message = `Hey! I have open spots on my shared plan. Join here to split the bill safely: ${link}`

  const copy = async () => {
    try { await navigator.clipboard.writeText(message) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className={SECTION}>Invite people</h3>
      <div className="flex flex-col gap-4 rounded-[24px] border-[2.5px] border-[#151515] bg-white p-4 shadow-[4px_4px_0_0_#151515]">
        <div className="flex items-center gap-3 rounded-full border-2 border-[#151515] bg-[#fbf6ee] py-1.5 pl-4 pr-1.5">
          <Ic s={18}>
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.5-1.5" />
          </Ic>
          <span className={`${MONO} min-w-0 flex-1 truncate text-[13px] font-bold`}>
            {link.replace('https://', '')}
          </span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy invite link"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#151515] active:translate-x-px active:translate-y-px ${copied ? 'bg-[#8de89a]' : 'bg-[#f7c85a]'}`}
          >
            {copied ? (
              <Ic s={16}><path d="M20 6L9 17l-5-5" /></Ic>
            ) : (
              <Ic s={16}>
                <rect x="9" y="9" width="11" height="11" rx="2.5" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" />
              </Ic>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 3. Delete pool ──────────────────────────────────────────────
export function DeletePool({ onDelete }: { onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="flex flex-col gap-3 border-t-2 border-dashed border-[#151515]/40 pt-5">
      {!confirm ? (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className={`${BTN} flex w-full items-center justify-center gap-2 bg-white text-[#b3261e]`}
        >
          <Ic s={16}>
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 14h10l1-14" />
            <path d="M10 11v6M14 11v6" />
          </Ic>
          Delete pool
        </button>
      ) : (
        <div className="rounded-[24px] border-[2.5px] border-[#b3261e] bg-[#fdecea] p-4">
          <p className="text-base font-extrabold">Delete this pool?</p>
          <p className="mt-1 text-sm font-medium text-[#4a463d]">
            This removes the pool and its invite link. You can only delete a pool while it is not running with paid members.
          </p>
          <div className="mt-3 flex gap-2.5">
            <button type="button" onClick={() => setConfirm(false)} className={`${BTN} flex-1 bg-white`}>
              Keep pool
            </button>
            <button type="button" onClick={onDelete} className={`${BTN} flex-1 bg-[#b3261e] text-white`}>
              Yes, delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
