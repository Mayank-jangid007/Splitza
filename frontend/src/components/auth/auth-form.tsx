'use client'

import Link from 'next/link'
import { Lock, Mail, User } from 'lucide-react'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

type Mode = 'sign-in' | 'sign-up'

const modes: { value: Mode; label: string; href: string }[] = [
  { value: 'sign-in', label: 'Sign in', href: '/auth/login' },
  { value: 'sign-up', label: 'Sign up', href: '/auth/register' },
]

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.55c2.08-1.91 3.24-4.74 3.24-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.75c-.98.66-2.24 1.05-3.73 1.05-2.87 0-5.3-1.94-6.17-4.55H2.17v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.17a11 11 0 0 0 0 9.86l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.36c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.17 7.07l3.66 2.84C6.7 7.3 9.13 5.36 12 5.36Z" />
    </svg>
  )
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  )
}

export function AuthForm({ mode }: { mode: Mode }) {
  const isSignIn = mode === 'sign-in'

  return (
    <section className="flex items-center justify-center px-5 py-10 sm:px-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        {/* Tab switcher */}
        <div
          role="tablist"
          aria-label="Account"
          className="grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-foreground bg-muted p-1.5"
        >
          {modes.map((item) => {
            const active = item.value === mode
            return (
              <Link
                key={item.value}
                href={item.href}
                role="tab"
                aria-selected={active}
                className={cn(
                  'rounded-xl py-2.5 text-center text-sm font-extrabold transition-colors',
                  neoFocus,
                  active
                    ? 'border-2 border-foreground bg-peach shadow-brutal-sm'
                    : 'border-2 border-transparent text-foreground/70 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isSignIn ? 'Sign in' : 'Create your account'}
          </h1>
          <p className="text-base font-medium text-foreground/70">
            {isSignIn
              ? 'Good to see you again. Enter your details below.'
              : 'It takes less than a minute to start sharing.'}
          </p>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={cn(
              'flex h-12 items-center justify-center gap-2.5 rounded-xl border-2 border-foreground bg-white text-sm font-bold',
              neoLift,
              neoFocus,
            )}
          >
            <GoogleMark />
            Google
          </button>
          <button
            type="button"
            className={cn(
              'flex h-12 items-center justify-center gap-2.5 rounded-xl border-2 border-foreground bg-white text-sm font-bold',
              neoLift,
              neoFocus,
            )}
          >
            <GithubMark />
            GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-0.5 flex-1 bg-foreground/15" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">or with email</span>
          <span className="h-0.5 flex-1 bg-foreground/15" />
        </div>

        {/* Form — real logic from existing components */}
        {isSignIn ? <LoginForm /> : <RegisterForm />}

        {/* Footer link */}
        <p className="text-center text-sm font-medium text-foreground/70">
          {isSignIn ? 'New to Splitza? ' : 'Already have an account? '}
          <Link
            href={isSignIn ? '/auth/register' : '/auth/login'}
            className={cn(
              'rounded font-extrabold text-foreground underline decoration-2 underline-offset-4 hover:bg-sun',
              neoFocus,
            )}
          >
            {isSignIn ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </div>
    </section>
  )
}
