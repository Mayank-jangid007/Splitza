import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthShowcase } from '@/components/auth/auth-showcase'

export const metadata: Metadata = {
  title: 'Create Account — Splitza',
  description: 'Join Splitza to start saving on your subscriptions or earn by hosting shared plans.',
}

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="grid min-h-dvh md:grid-cols-[1fr_1fr] lg:grid-cols-[5fr_7fr]">
        {/* Left — showcase (hidden on mobile, shown on md+) */}
        <div className="hidden md:block">
          <AuthShowcase mode="sign-up" />
        </div>

        {/* Right — form */}
        <div className="flex min-h-dvh flex-col justify-center overflow-y-auto">
          <AuthForm mode="sign-up" />
        </div>
      </div>
    </div>
  )
}
