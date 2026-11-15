'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { auth as authApi, ApiError } from '@/lib/api'
import { LegalConsent } from '@/components/auth/legal-consent'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

export default function AcceptTermsPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [agreed, setAgreed] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [loading, user, router])

  async function accept() {
    if (!agreed) {
      setInvalid(true)
      return
    }
    setSaving(true)
    setError('')
    try {
      await authApi.acceptConsent()
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your consent. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin" aria-hidden="true" />
      </div>
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10">
      <div className="flex w-full max-w-md flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">One last step</h1>
          <p className="text-base font-medium text-foreground/70">
            Please accept our updated terms to continue using Splitza.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <LegalConsent
          checked={agreed}
          onCheckedChange={(v) => {
            setAgreed(v)
            setInvalid(false)
          }}
          invalid={invalid}
        />

        <button
          type="button"
          disabled={!agreed || saving}
          onClick={accept}
          className={cn(
            'flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-peach px-5 text-base font-extrabold disabled:pointer-events-none disabled:opacity-70',
            neoLift,
            neoFocus,
          )}
        >
          {saving ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Saving
            </>
          ) : (
            'Continue'
          )}
        </button>

        <button
          type="button"
          onClick={() => void logout()}
          className="text-center text-sm font-bold text-foreground/70 underline decoration-2 underline-offset-4 hover:bg-sun"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
