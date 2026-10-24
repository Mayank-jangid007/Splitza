import Image from 'next/image'
import { Brand } from '@/components/dashboard/brand'

export function AuthShowcase({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignIn = mode === 'sign-in'
  return (
    <aside className="bg-dots relative flex flex-col justify-between gap-8 overflow-hidden border-b-2 border-foreground bg-sun p-6 sm:p-10 md:border-b-0 md:border-r-2">
      <Brand href="/" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="max-w-md text-4xl font-extrabold leading-[1.05] tracking-tight text-balance lg:text-5xl">
            {isSignIn
              ? 'Welcome back to your pools.'
              : 'Split subscriptions, not the bill.'}
          </h2>
          <p className="max-w-sm text-base font-medium text-foreground/75 text-pretty">
            {isSignIn
              ? 'Pick up where you left off. Your seats, invites and payouts are right where you left them.'
              : 'Join a shared plan or share your own. Everyone pays their fair slice, safely held in escrow.'}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:mx-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border-2 border-foreground bg-foreground"
          />
          <div className="relative overflow-hidden rounded-3xl border-2 border-foreground bg-card">
            <Image
              src="/illustrations/signin-hero.png"
              alt="Friends cheering beside an open door with a golden ticket and a pink key"
              width={1024}
              height={1024}
              priority
              sizes="(min-width: 768px) 384px, 90vw"
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
