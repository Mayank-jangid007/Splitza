import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Flower, Squiggle } from './stickers'
import { Chip, NeoButton } from './ui'

const CROSS_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'%3E%3Cpath d='M11 6v10M6 11h10' stroke='%23151515' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E")`

export function Hero({
  userName,
  onShare,
  onBrowse,
}: {
  userName: string
  onShare: () => void
  onBrowse: () => void
}) {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[34%] top-[30%] hidden size-64 rounded-full opacity-[0.16] lg:block"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at center, transparent 0 18px, #151515 18px 20px)',
          }}
        />
        <div className="dots-bg absolute bottom-0 left-[38%] hidden h-24 w-56 rotate-[-4deg] rounded-2xl opacity-60 md:block" />
        <div
          className="absolute right-[46%] top-0 hidden h-24 w-32 opacity-50 lg:block"
          style={{ backgroundImage: CROSS_PATTERN, backgroundSize: '22px 22px' }}
        />
      </div>

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div className="relative">
          <div className="mb-6 flex items-center gap-3">
            <Chip tone="sun" className="py-1.5 text-xs">
              Hello, {userName}
            </Chip>
            <Squiggle className="hidden h-4 w-24 sm:block" />
          </div>

          <h1
            id="hero-title"
            aria-label="Pool it up."
            className="font-display-tight text-[clamp(3.5rem,11vw,7.5rem)] font-black uppercase"
          >
            <span className="flex items-center" aria-hidden="true">
              P
              <Flower className="animate-spin-slow -mx-[0.02em] size-[0.8em] shrink-0" fill="#f5aee3" />
              <Flower className="animate-spin-slow -mx-[0.02em] size-[0.8em] shrink-0 [animation-direction:reverse]" fill="#f8d56b" />
              l
            </span>
            <span className="block">it up.</span>
          </h1>

          <div aria-hidden="true" className="mt-4 flex items-center gap-3">
            <span className="stripes-bg h-3.5 w-36 rounded-full border-2 border-ink bg-sun" />
            <Flower className="animate-spin-slow size-7" fill="#a4ecb0" petals={8} />
          </div>

          <p className="mt-5 max-w-sm text-base font-bold sm:text-lg">
            Split subscriptions with people you trust.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <NeoButton tone="sun" size="lg" onClick={onShare}>
              <Plus className="size-5" strokeWidth={3.5} />
              Share a plan
            </NeoButton>
            <NeoButton tone="paper" size="lg" onClick={onBrowse}>
              Join a subscription
            </NeoButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <Image
            src="/illustrations/splitza-mascot.webp"
            alt="Splitza mascot with Netflix, Spotify and YouTube subscription bubbles"
            width={1254}
            height={1254}
            priority
            sizes="(min-width: 1024px) 42vw, (min-width: 640px) 36rem, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>

    </section>
  )
}
