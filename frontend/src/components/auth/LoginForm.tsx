'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'
import { TextField } from './text-field'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const { login, user, accessToken, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (!authLoading && user && accessToken) {
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard')
    }
  }, [user, accessToken, authLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setServerError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.email) newErrors.email = 'Email is required'
    if (!form.password) newErrors.password = 'Password is required'
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }

    setLoading(true)
    setServerError('')
    try {
      const result = await login(form.email, form.password)
      router.push(result.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && (
        <p role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {serverError}
        </p>
      )}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        icon={<Mail />}
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        icon={<Lock />}
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        required
        hint={
          <Link
            href="/auth/forgot-password"
            className={cn('rounded text-sm font-bold underline decoration-2 underline-offset-4 hover:bg-sun', neoFocus)}
          >
            Forgot password?
          </Link>
        }
      />

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'mt-2 flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-peach px-5 text-base font-extrabold disabled:pointer-events-none disabled:opacity-70',
          neoLift,
          neoFocus,
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Signing in
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="size-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
