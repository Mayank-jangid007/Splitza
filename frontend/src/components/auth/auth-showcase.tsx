import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function AuthShowcase({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignIn = mode === 'sign-in'
  return (
    <aside className="bg-dots relative flex h-full flex-col justify-between gap-8 overflow-hidden border-b-2 border-foreground bg-sun p-6 sm:p-10 md:border-b-0 md:border-r-2">
      <Link href="/" aria-label="Splitza home">
        <img src="/logos/splitza-logo-white.png" alt="Splitza" className="h-10 w-auto" />
      </Link>

      <div className={cn('flex flex-col gap-6', !isSignIn && 'flex-1 items-center justify-center text-center')}>
        <div className="flex w-full flex-col gap-3">
          <h2 className={cn('max-w-md text-4xl font-extrabold leading-[1.05] tracking-tight text-balance lg:text-5xl', !isSignIn && 'mx-auto')}>
            {isSignIn
              ? 'Welcome back to your pools.'
              : 'Split subscriptions, not the bill.'}
          </h2>
          <p className={cn('max-w-sm text-base font-medium text-foreground/75 text-pretty', !isSignIn && 'mx-auto')}>
            {isSignIn
              ? 'Pick up where you left off. Your seats, invites and payouts are right where you left them.'
              : 'Join a shared plan or share your own. Everyone pays their fair slice, safely held in escrow.'}
          </p>
        </div>

        <div className={cn('relative w-full max-w-sm', isSignIn ? 'mx-auto md:mx-0' : 'mx-auto')}>
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
