'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lock, Mail, Phone, User, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'
import { TextField } from './text-field'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

export default function RegisterForm() {
  const router = useRouter()
  const { register, user, accessToken, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

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

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Full name is required'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required'
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!form.password || form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setServerError('')
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: 'COHOST',
      })
      sessionStorage.setItem('splitza_otp_identifier', form.email)
      router.push('/auth/verify-otp')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
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
        label="Full name"
        name="name"
        autoComplete="name"
        placeholder="Aarav Sharma"
        icon={<User />}
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        required
      />

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
        label="Mobile number (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="9876543210"
        icon={<Phone />}
        value={form.phone}
        onChange={handleChange}
        error={errors.phone}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        icon={<Lock />}
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        minLength={8}
        required
      />

      <TextField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        icon={<Lock />}
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        required
      />

      <p className="text-xs font-medium text-foreground/70">
        By creating an account you agree to our{' '}
        <Link href="/terms" className={cn('font-bold underline decoration-2 underline-offset-4 hover:bg-sun', neoFocus)}>Terms</Link>{' '}
        and{' '}
        <Link href="/privacy" className={cn('font-bold underline decoration-2 underline-offset-4 hover:bg-sun', neoFocus)}>Privacy Policy</Link>.
      </p>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'mt-1 flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-peach px-5 text-base font-extrabold disabled:pointer-events-none disabled:opacity-70',
          neoLift,
          neoFocus,
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Creating account
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="size-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  )
}
