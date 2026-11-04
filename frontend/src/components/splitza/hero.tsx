import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Flower, Squiggle } from './stickers'
import { Chip, NeoButton } from './ui'

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
              <Flower className="animate-spin-slow -mx-[0.02em] size-[0.8em] shrink-0" fill="#A9C7F7" />
              <Flower className="animate-spin-slow -mx-[0.02em] size-[0.8em] shrink-0 [animation-direction:reverse]" fill="#f8d56b" />
              l
            </span>
            <span className="block">it up.</span>
          </h1>

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
