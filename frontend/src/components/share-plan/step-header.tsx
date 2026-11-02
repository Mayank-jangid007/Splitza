import type { ReactNode } from 'react'
import { Squiggle } from './neo'

export function StepHeader({
  kicker,
  title,
  description,
}: {
  kicker: string
  title: ReactNode
  description: string
}) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 items-center rounded-full border-2 border-ink bg-sun px-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
          {kicker}
        </span>
        <Squiggle className="text-ink" />
      </div>
      <h1
        id="step-heading"
        tabIndex={-1}
        className="text-balance font-display text-3xl font-black leading-[1] tracking-tight outline-none sm:text-4xl"
      >
        {title}
      </h1>
      <p className="max-w-md text-pretty text-sm leading-relaxed text-stone">{description}</p>
    </header>
  )
}
