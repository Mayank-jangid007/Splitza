'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Lock, Mail, Megaphone, Send } from 'lucide-react'
import { MailScene } from './illustrations'
import { PageShell, Tag, box, mono, press } from './shell'

const TOPICS = [
  { value: 'General Suggestion', color: '#a4ecb0', sub: 'Ideas to make Splitza better' },
  { value: 'Report a Technical Bug', color: '#a9c7f7', sub: 'Something is broken or glitchy' },
  { value: 'Payment Issue', color: '#f8d56b', sub: 'UPI, escrow or payout trouble' },
  { value: 'Other', color: '#cdb6f5', sub: 'Anything else on your mind' },
] as const

const MAX = 500
const MIN = 10

export function FeedbackPage({ email }: { email: string }) {
  const uid = useId()
  const [topic, setTopic] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const ddRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ddRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < MIN) {
      setError(`Please add a few more details (at least ${MIN} characters).`)
      return
    }
    setSending(true)
    try {
      // TODO: replace with your API call, e.g.
      // await fetch('/api/support', { method: 'POST', body: JSON.stringify({ topic: TOPICS[topic].value, message }) })
      await new Promise((r) => setTimeout(r, 900))
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  function reset() {
    setSent(false)
    setMessage('')
    setError('')
  }

  const t = TOPICS[topic]
  const pct = (message.length / MAX) * 100

  return (
    <PageShell>
      <div className="mt-[22px] grid gap-7 md:grid-cols-[5fr_7fr] md:items-start">
        {/* illustration panel */}
        <aside
          className={`relative min-h-[520px] overflow-hidden rounded-[32px] bg-[#b9acf7] p-[26px] md:sticky md:top-5 md:min-h-[560px] ${box}`}
        >
          <Tag>Feedback &amp; support</Tag>
          <h1 className="mt-3.5 text-[clamp(40px,6vw,64px)] font-extrabold leading-[.9] tracking-[-0.05em]">
            Tell us
            <br />
            anything.
          </h1>
          <p className="mt-3.5 max-w-[300px] text-[15px] font-semibold leading-normal">
            Ideas, bugs or payment trouble: one form, one inbox. A real person replies to your email.
          </p>
          <div className="absolute inset-x-0 bottom-2.5 flex justify-center">
            <MailScene className="w-[min(94%,330px)]" />
          </div>
        </aside>

        {/* form sheet */}
        <section className={`rounded-[30px] bg-white p-[22px] sm:p-[30px] ${box}`}>
          {sent ? (
            <div role="status" className="px-2 py-6 text-center">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="#151515" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" className="mx-auto" aria-hidden="true">
                <circle cx="60" cy="60" r="46" fill="#a4ecb0" />
                <path d="M38 62l16 16 28-32" />
              </svg>
              <h3 className="mb-1.5 mt-3.5 text-[34px] font-extrabold tracking-[-0.04em]">Message sent!</h3>
              <p className="mx-auto mb-5 max-w-[340px] font-semibold leading-normal">
                Thanks. We&apos;ll reply to <b>{email}</b> within 1–2 working days.
              </p>
              <button type="button" onClick={reset} className={`rounded-full bg-white px-[22px] py-3 font-extrabold ${box} !shadow-[3px_3px_0_0_#151515] ${press}`}>
                Send another
              </button>
            </div>
          ) : (
            <>
              <div className="mb-[22px] flex items-center gap-3 border-b-[3px] border-dashed border-[#151515]/30 pb-[18px]">
                <span className="grid size-10 place-items-center rounded-xl border-[2.5px] border-[#151515] bg-[#a9c7f7]">
                  <Megaphone className="size-5" strokeWidth={2.6} aria-hidden="true" />
                </span>
                <h2 className="text-[15px] font-extrabold uppercase leading-tight tracking-[.06em]">
                  Share your feedback
                  <br />
                  or get support
                </h2>
              </div>

              <form onSubmit={submit} noValidate>
                {/* topic */}
                <div className="mb-[22px]">
                  <span id={`${uid}-topic`} className="mb-2 block text-[13px] font-extrabold">
                    What can we help you with?
                  </span>
                  <div ref={ddRef} className="relative">
                    <button
                      ref={btnRef}
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={menuOpen}
                      aria-labelledby={`${uid}-topic ${uid}-btn`}
                      id={`${uid}-btn`}
                      onClick={() => setMenuOpen((o) => !o)}
                      className={`flex h-14 w-full items-center gap-3 rounded-2xl border-[3px] border-[#151515] bg-white px-3.5 text-left text-base font-extrabold focus-visible:shadow-[4px_4px_0_0_#151515] ${menuOpen ? 'shadow-[4px_4px_0_0_#151515]' : ''}`}
                    >
                      <span className="size-[22px] flex-none rounded-full border-[2.5px] border-[#151515]" style={{ background: t.color }} />
                      <span>{t.value}</span>
                      <ChevronDown className={`ml-auto size-5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} strokeWidth={3.2} />
                    </button>
                    {menuOpen && (
                      <ul
                        role="listbox"
                        aria-labelledby={`${uid}-topic`}
                        className="absolute inset-x-0 top-[calc(100%+8px)] z-10 m-0 list-none rounded-[18px] border-[3px] border-[#151515] bg-white p-1.5 shadow-[5px_5px_0_0_#151515]"
                      >
                        {TOPICS.map((x, i) => (
                          <li
                            key={x.value}
                            role="option"
                            aria-selected={i === topic}
                            onClick={() => {
                              setTopic(i)
                              setMenuOpen(false)
                              btnRef.current?.focus()
                            }}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 font-extrabold hover:bg-[#fbf6ee] ${i === topic ? 'bg-[#fbf6ee]' : ''}`}
                          >
                            <span className="size-[22px] flex-none rounded-full border-[2.5px] border-[#151515]" style={{ background: x.color }} />
                            <span>
                              {x.value}
                              <small className="block text-xs font-semibold text-[#6b6558]">{x.sub}</small>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* message */}
                <div className="mb-[22px]">
                  <label htmlFor={`${uid}-msg`} className="mb-2 block text-[13px] font-extrabold">
                    Tell us the details
                  </label>
                  <textarea
                    id={`${uid}-msg`}
                    value={message}
                    maxLength={MAX}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (e.target.value.trim().length >= MIN) setError('')
                    }}
                    placeholder="What happened, or what should we build next?"
                    aria-describedby={`${uid}-err`}
                    className={`min-h-[170px] w-full resize-y rounded-[18px] border-4 bg-white px-4 py-3.5 text-base font-semibold leading-normal outline-none focus:bg-[#fffdf4] focus:shadow-[5px_5px_0_0_#151515] ${error ? 'border-[#c2261a] shadow-[5px_5px_0_0_#c2261a]' : 'border-[#151515]'}`}
                  />
                  <div className="mt-2 h-2 overflow-hidden rounded-[9px] border-2 border-[#151515] bg-white" aria-hidden="true">
                    <div
                      className="h-full transition-[width,background-color] duration-150"
                      style={{ width: `${pct}%`, background: message.length > 450 ? '#ff8a7a' : message.length > 350 ? '#f8d56b' : '#a4ecb0' }}
                    />
                  </div>
                  <div className="flex justify-between gap-2.5">
                    <p id={`${uid}-err`} role="alert" className="mt-1.5 min-h-4 text-xs font-extrabold text-[#c2261a]">
                      {error}
                    </p>
                    <p className="mt-1.5 text-xs font-semibold text-[#6b6558]" style={mono}>
                      {message.length} / {MAX}
                    </p>
                  </div>
                </div>

                {/* email */}
                <div className="mb-[22px]">
                  <span className="mb-2 block text-[13px] font-extrabold">We&apos;ll reply to</span>
                  <div className="flex items-center gap-3 rounded-2xl border-[3px] border-dashed border-[#151515] bg-[#fbf6ee] px-3.5 py-3">
                    <span className="grid size-[38px] flex-none place-items-center rounded-xl border-[2.5px] border-[#151515] bg-[#a9c7f7]">
                      <Mail className="size-5" strokeWidth={2.6} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <b className="block break-all text-[15px]">{email}</b>
                      <span className="text-xs font-semibold text-[#6b6558]">Your logged-in email. Replies land here.</span>
                    </div>
                    <Lock className="ml-auto size-[18px] flex-none" strokeWidth={2.6} aria-label="Read only" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="flex h-[60px] w-full items-center justify-center gap-2.5 rounded-full border-[3px] border-[#151515] bg-[#a4ecb0] text-lg font-extrabold shadow-[5px_5px_0_0_#151515] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#151515] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-60"
                >
                  <Send className="size-[22px]" strokeWidth={2.8} aria-hidden="true" />
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </PageShell>
  )
}
