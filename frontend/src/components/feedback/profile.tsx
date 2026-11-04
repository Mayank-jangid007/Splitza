'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { Check, Eye, EyeOff, Lock, UserRound } from 'lucide-react'
import { Avatar } from '@/components/splitza/ui'
import { PayoutSettings } from './payout-settings'
import { PageShell, Tag, box, field, mono, pastelBtn } from './shell'
import { auth as authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const STRENGTH = ['At least 8 characters.', 'Weak', 'Okay', 'Good', 'Strong']
const STRENGTH_COLOR = ['#fff', '#ff8a7a', '#f8d56b', '#a4ecb0', '#a4ecb0']

function strength(v: string) {
  let s = 0
  if (v.length >= 8) s++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return s
}

type Props = {
  name: string
  email: string
  upi?: string
  hasPassword?: boolean
}

export function ProfilePage({
  name: initialName,
  email,
  upi: initialUpi = '',
  hasPassword = true,
}: Props) {
  const uid = useId()
  const { user, refreshUser } = useAuth()

  // toast
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  function notify(msg: string) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  // name
  const [name, setName] = useState(initialName)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(initialName)
  const [nameError, setNameError] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  async function saveName(e: FormEvent) {
    e.preventDefault()
    const v = nameDraft.trim()
    if (v.length < 2) {
      setNameError('Name needs at least 2 characters.')
      return
    }

    setNameSaving(true)
    setNameError('')
    try {
      await authApi.updateProfile({ name: v })
      await refreshUser()
      setName(v)
      setEditingName(false)
      notify('Name updated')
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Could not update name.')
    } finally {
      setNameSaving(false)
    }
  }

  // password
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false })
  const [pwError, setPwError] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const score = strength(pw.next)

  async function savePassword(e: FormEvent) {
    e.preventDefault()
    const err =
      hasPassword && !pw.current
        ? 'Enter your current password.'
        : pw.next.length < 8
          ? 'New password needs at least 8 characters.'
          : pw.next !== pw.confirm
            ? 'Passwords do not match.'
            : ''
    setPwError(err)
    if (err) return

    setPwSaving(true)
    try {
      await authApi.changePassword({
        ...(hasPassword ? { currentPassword: pw.current } : {}),
        newPassword: pw.next,
      })
      await refreshUser()
      setPw({ current: '', next: '', confirm: '' })
      setPwOpen(false)
      notify(hasPassword ? 'Password updated' : 'Password set')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not update password.')
    } finally {
      setPwSaving(false)
    }
  }

  const itemCls =
    'flex items-center gap-3 rounded-2xl border-[2.5px] border-[#151515] bg-[#fbf6ee] px-3.5 py-3'
  const smallBtn = `${pastelBtn} !h-10 !bg-white px-4 text-[13px]`
  const labelCls = 'mb-2 block text-[13px] font-extrabold'
  const pwFields: ReadonlyArray<readonly ['current' | 'next', string, string]> = hasPassword
    ? [
      ['current', 'Current password', 'current-password'],
      ['next', 'New password', 'new-password'],
    ]
    : [['next', 'New password', 'new-password']]

  return (
    <PageShell>
      {/* hero */}
      <header
        className={`relative mt-[22px] flex flex-wrap items-center gap-[18px] overflow-hidden rounded-[32px] bg-[#b9acf7] p-[22px] sm:px-8 sm:py-[26px] ${box}`}
      >
        <Avatar
          name={name}
          avatarUrl={user?.avatarUrl}
          index={1}
          size={92}
          className="flex-none shadow-neo-sm"
        />
        <div className="relative z-10">
          <Tag>Account &amp; payout hub</Tag>
          <h1 className="mt-1.5 text-[clamp(34px,6vw,56px)] font-extrabold leading-[.95] tracking-[-0.05em]">
            {name}
          </h1>
          <p className="mt-1.5 text-sm font-semibold">
            Manage how you sign in and where your earnings land.
          </p>
        </div>
      </header>

      <div className="mt-[22px] grid gap-[22px] md:grid-cols-2">
        {/* ACCOUNT */}
        <section
          aria-labelledby={`${uid}-acc`}
          className={`flex flex-col rounded-[28px] bg-white p-[22px] sm:p-7 ${box}`}
        >
          <div className="mb-5 flex items-center gap-3 border-b-[3px] border-dashed border-[#151515]/30 pb-4">
            <span className="grid size-11 flex-none place-items-center rounded-[14px] border-[2.5px] border-[#151515] bg-[#a9c7f7]">
              <UserRound className="size-[22px]" strokeWidth={2.6} aria-hidden="true" />
            </span>
            <h2 id={`${uid}-acc`} className="text-sm font-extrabold uppercase tracking-[.07em]">
              Account info
            </h2>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* name */}
            <div className={itemCls}>
              <div className="min-w-0 flex-1">
                <small className="block text-[11px] font-bold uppercase tracking-widest text-[#6b6558]">
                  Name
                </small>
                {editingName ? (
                  <form onSubmit={saveName} noValidate className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameDraft}
                      maxLength={30}
                      onChange={(e) => setNameDraft(e.target.value)}
                      aria-label="Your name"
                      className={`${field} !h-11 min-w-0 !rounded-xl`}
                    />
                    <button
                      type="submit"
                      disabled={nameSaving}
                      className={`${pastelBtn} !h-10 px-3.5 text-sm`}
                    >
                      {nameSaving ? 'Saving…' : 'Save'}
                    </button>
                  </form>
                ) : (
                  <b className="break-all text-[17px]">{name}</b>
                )}
                {nameError && (
                  <p role="alert" className="mt-1 text-xs font-extrabold text-[#c2261a]">
                    {nameError}
                  </p>
                )}
              </div>
              <button
                type="button"
                className={smallBtn}
                onClick={() => {
                  setEditingName((v) => !v)
                  setNameDraft(name)
                  setNameError('')
                }}
              >
                {editingName ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* email */}
            <div className={itemCls}>
              <div className="min-w-0">
                <small className="block text-[11px] font-bold uppercase tracking-widest text-[#6b6558]">
                  Email
                </small>
                <b className="break-all text-[17px]">{email}</b>
              </div>
              <Lock
                className="ml-auto size-[18px] flex-none"
                strokeWidth={2.6}
                aria-label="Linked, cannot be edited"
              />
            </div>

            {/* password */}
            <div className={itemCls}>
              <div>
                <small className="block text-[11px] font-bold uppercase tracking-widest text-[#6b6558]">
                  Password
                </small>
                <b className="text-[17px] tracking-[.2em]" style={mono}>
                  {hasPassword ? '••••••••••' : 'Not set'}
                </b>
              </div>
              <button
                type="button"
                className={`${smallBtn} ml-auto`}
                aria-expanded={pwOpen}
                aria-controls={`${uid}-pw`}
                onClick={() => setPwOpen((v) => !v)}
              >
                {pwOpen ? 'Cancel' : hasPassword ? 'Change' : 'Set'}
              </button>
            </div>
          </div>

          {pwOpen && (
            <form
              id={`${uid}-pw`}
              onSubmit={savePassword}
              noValidate
              className="mt-[18px] rounded-[20px] border-[3px] border-[#151515] bg-[#fffdf4] p-4"
            >
              {pwFields.map(([k, label, ac]) => (
                <div key={k} className="mb-3">
                  <label htmlFor={`${uid}-${k}`} className={labelCls}>
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      id={`${uid}-${k}`}
                      type={show[k] ? 'text' : 'password'}
                      autoComplete={ac}
                      value={pw[k]}
                      onChange={(e) => setPw((p) => ({ ...p, [k]: e.target.value }))}
                      className={`${field} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
                      aria-label={show[k] ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-2 grid size-9 place-items-center rounded-[10px] hover:bg-[#151515]/10"
                    >
                      {show[k] ? (
                        <EyeOff className="size-[18px]" />
                      ) : (
                        <Eye className="size-[18px]" />
                      )}
                    </button>
                  </div>
                  {k === 'next' && (
                    <>
                      <div className="mt-2 flex gap-[5px]" aria-hidden="true">
                        {[0, 1, 2, 3].map((i) => (
                          <i
                            key={i}
                            className="h-2 flex-1 rounded-[9px] border-2 border-[#151515]"
                            style={{
                              background: i < score ? STRENGTH_COLOR[score] : '#fff',
                            }}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-xs font-semibold text-[#6b6558]">
                        {STRENGTH[score]}
                      </p>
                    </>
                  )}
                </div>
              ))}
              <div className="mb-3">
                <label htmlFor={`${uid}-confirm`} className={labelCls}>
                  Confirm new password
                </label>
                <input
                  id={`${uid}-confirm`}
                  type="password"
                  autoComplete="new-password"
                  value={pw.confirm}
                  onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                  className={field}
                />
                <p
                  role="alert"
                  className="mt-1.5 min-h-4 text-xs font-extrabold text-[#c2261a]"
                >
                  {pwError}
                </p>
              </div>
              <button
                type="submit"
                disabled={pwSaving}
                className={`${pastelBtn} h-12 w-full text-[15px]`}
              >
                {pwSaving
                  ? 'Saving…'
                  : hasPassword
                    ? 'Update password'
                    : 'Set password'}
              </button>
            </form>
          )}

          <div className="mt-auto pt-5">
            <div className={`${itemCls} !bg-[#a4ecb0] text-[13px] font-bold leading-snug`}>
              <span>
                Need to change your email?{' '}
                <a href="/feedback" className="font-extrabold underline">
                  Contact support
                </a>
              </span>
            </div>
          </div>
        </section>

        <PayoutSettings
          initialUpi={initialUpi}
          onSave={async (value) => {
            await authApi.updateProfile({ upiId: value })
            await refreshUser()
          }}
          onSaved={() => notify('Payout UPI saved. Weekly routing will use it.')}
        />
      </div>

      <div
        role="status"
        className={`pointer-events-none fixed bottom-[22px] left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-2.5 rounded-full bg-[#151515] px-[22px] py-[13px] text-sm font-extrabold text-white transition-all duration-300 ${toast ? 'translate-y-0 opacity-100' : 'translate-y-[120px] opacity-0'}`}
      >
        <i className="grid size-[22px] flex-none place-items-center rounded-full bg-[#a4ecb0] text-[#151515]">
          <Check className="size-3.5" strokeWidth={4} />
        </i>
        <span>{toast}</span>
      </div>
    </PageShell>
  )
}
