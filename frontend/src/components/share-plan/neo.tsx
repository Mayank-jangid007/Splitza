'use client'

import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'
import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'sun' | 'ink' | 'paper' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const toneClass: Record<Tone, string> = {
  sun: 'bg-sun text-ink border-ink hard-shadow hover:-translate-x-px hover:-translate-y-px hover:hard-shadow-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  ink: 'bg-ink text-paper border-ink hard-shadow hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  paper: 'bg-paper text-ink border-ink hard-shadow-sm hover:bg-sun-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
  ghost: 'bg-transparent text-ink border-transparent hover:bg-ink/5',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-6 text-sm gap-2.5',
}

export function buttonClass(tone: Tone = 'paper', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center rounded-full border-2 font-bold tracking-tight transition-all duration-150',
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink',
    'disabled:pointer-events-none disabled:border-ink/25 disabled:bg-muted disabled:text-ink/35 disabled:shadow-none',
    toneClass[tone],
    sizeClass[size],
    className,
  )
}

export function Button({
  tone = 'paper',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: Size }) {
  return <button type={type} className={buttonClass(tone, size, className)} {...props} />
}

export function Card({
  className,
  children,
  as: Tag = 'div',
}: {
  className?: string
  children: ReactNode
  as?: 'div' | 'section' | 'article'
}) {
  return <Tag className={cn('rounded-3xl border-2 border-ink bg-paper hard-shadow', className)}>{children}</Tag>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-ink', className)}>{children}</p>
  )
}

export function Chip({
  children,
  tone = 'paper',
  className,
}: {
  children: ReactNode
  tone?: 'paper' | 'sun' | 'lilac' | 'mint' | 'bubblegum' | 'ink'
  className?: string
}) {
  const tones = {
    paper: 'bg-paper text-ink',
    sun: 'bg-sun text-ink',
    lilac: 'bg-lilac text-ink',
    mint: 'bg-mint text-ink',
    bubblegum: 'bg-bubblegum text-ink',
    ink: 'bg-ink text-paper',
  }
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full border-2 border-ink px-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  aside,
}: {
  label: string
  hint?: string
  error?: string | null
  htmlFor?: string
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-xs font-bold text-tomato">
          {error}
        </p>
      ) : hint ? (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-xs leading-relaxed text-stone">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function TextInput({
  prefix,
  suffix,
  invalid,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  prefix?: ReactNode
  suffix?: ReactNode
  invalid?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-13 items-center gap-2 rounded-2xl border-2 bg-paper px-4 transition-shadow',
        'focus-within:hard-shadow',
        invalid ? 'border-tomato' : 'border-ink',
        className,
      )}
    >
      {prefix ? <span className="shrink-0 font-display text-base font-black">{prefix}</span> : null}
      <input
        aria-invalid={invalid || undefined}
        className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink/35"
        {...props}
      />
      {suffix}
    </div>
  )
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-full border-2 border-ink bg-paper p-1"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-10 rounded-full px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink',
              active ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-ink/5 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Counter({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (value: number) => void
}) {
  const id = useId()
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className="flex h-13 items-center justify-between rounded-2xl border-2 border-ink bg-paper p-1.5">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-lilac transition-transform active:scale-95 disabled:opacity-30"
      >
        <Minus className="size-4" strokeWidth={3} />
      </button>
      <label htmlFor={id} className="flex items-baseline gap-1.5">
        <span className="sr-only">{label}</span>
        <input
          id={id}
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/\D/g, ''))
            if (Number.isFinite(n)) onChange(clamp(n || min))
          }}
          className="w-12 bg-transparent text-center font-display text-xl font-black outline-none"
        />
        <span className="text-xs font-bold text-stone">{unit}</span>
      </label>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-mint transition-transform active:scale-95 disabled:opacity-30"
      >
        <Plus className="size-4" strokeWidth={3} />
      </button>
    </div>
  )
}

export function SeatDots({ total, filled = 1, className }: { total: number; filled?: number; className?: string }) {
  const shown = Math.min(total, 13)
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} aria-label={`${filled} of ${total} seats filled`}>
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn('size-4 rounded-full border-2 border-ink', i < filled ? 'bg-ink' : 'bg-paper')}
        />
      ))}
    </div>
  )
}

export function Illo({
  src,
  alt = '',
  tint = 'bg-lilac',
  className,
  priority,
}: {
  src: string
  alt?: string
  tint?: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-3xl border-2 border-ink', tint, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 360px, 50vw"
        className="object-contain p-3 mix-blend-multiply"
      />
    </div>
  )
}

export function BrandMark({ src, alt, tint, className }: { src: string; alt: string; tint: string; className?: string }) {
  return (
    <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-ink', tint, className)}>
      <Image src={src} alt={alt} width={26} height={26} className="size-6.5 object-contain" />
    </span>
  )
}

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 16" fill="none" aria-hidden="true" className={cn('h-3 w-20', className)}>
      <path
        d="M2 8c6-8 12-8 18 0s12 8 18 0 12-8 18 0 12 8 18 0 12-8 18 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
