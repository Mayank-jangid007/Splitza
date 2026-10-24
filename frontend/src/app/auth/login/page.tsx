import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShowcase } from '@/components/auth/auth-showcase'

export const metadata: Metadata = {
  title: 'Sign In — Splitza',
  description: 'Sign in to your Splitza account to manage your subscriptions, slots, and payouts.',
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="grid min-h-dvh md:grid-cols-[1fr_1fr] lg:grid-cols-[5fr_7fr]">
        {/* Left — showcase (hidden on mobile, shown on md+) */}
        <div className="hidden md:block">
          <AuthShowcase mode="sign-in" />
        </div>

        {/* Right — form */}
        <div className="flex min-h-dvh flex-col justify-center overflow-y-auto">
          <AuthForm mode="sign-in" />
        </div>
      </div>
    </div>
  )
}
