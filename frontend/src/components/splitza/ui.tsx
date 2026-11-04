'use client'

import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import Image from 'next/image'
import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { detectPlatform, initialsOf } from '@/lib/splitza'

type ButtonTone = 'sun' | 'ink' | 'pop' | 'paper' | 'lav' | 'mint'

const TONES: Record<ButtonTone, string> = {
  sun: 'bg-sun text-ink',
  ink: 'bg-ink text-paper shadow-[4px_4px_0_0_#b3a6f7]',
  pop: 'bg-pop text-ink',
  paper: 'bg-paper text-ink',
  lav: 'bg-lav text-ink',
  mint: 'bg-mint text-ink',
}

export const NeoButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: ButtonTone
    size?: 'sm' | 'md' | 'lg'
  }
>(function NeoButton({ tone = 'sun', size = 'md', className, ...props }, ref) {
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        'neo-press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-ink font-bold shadow-neo outline-none focus-visible:ring-4 focus-visible:ring-ink/30 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'h-9 px-4 text-xs',
        size === 'md' && 'h-11 px-6 text-sm',
        size === 'lg' && 'h-14 px-8 text-base',
        TONES[tone],
        className,
      )}
    />
  )
})

export function Chip({
  children,
  tone = 'paper',
  className,
}: {
  children: React.ReactNode
  tone?: 'paper' | 'sun' | 'pop' | 'lav' | 'mint' | 'sky' | 'ink' | 'tang'
  className?: string
}) {
  const tones = {
    paper: 'bg-paper',
    sun: 'bg-sun',
    pop: 'bg-pop',
    lav: 'bg-lav',
    mint: 'bg-mint',
    sky: 'bg-sky',
    tang: 'bg-tang',
    ink: 'bg-ink text-paper',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function PlatformLogo({
  name,
  size = 48,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const info = detectPlatform(name)
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-2xl border-2 border-ink shadow-neo-sm',
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: info?.tint ?? '#f8d56b',
      }}
    >
      {info ? (
        <Image
          src={info.logo}
          alt={`${info.label} logo`}
          width={size}
          height={size}
          unoptimized
          className="object-contain"
          style={{ width: size * 0.56, height: size * 0.56 }}
        />
      ) : (
        <span
          className="font-display text-ink"
          style={{ fontSize: size * 0.34, fontWeight: 900, letterSpacing: '-0.04em' }}
          aria-label={`${name || 'Pool'} initials`}
        >
          {initialsOf(name)}
        </span>
      )}
    </span>
  )
}

const AVATAR_TONES = ['#f5aee3', '#f8d56b', '#a9c7f7', '#a4ecb0', '#b3a6f7', '#ffb59a']

export function Avatar({
  name,
  avatarUrl,
  index = 0,
  size = 32,
  className,
}: {
  name: string
  avatarUrl?: string | null
  index?: number
  size?: number
  className?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showImage = Boolean(avatarUrl) && failedUrl !== avatarUrl

  return (
    <span
      title={name}
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-ink font-display font-black text-ink',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        backgroundColor: AVATAR_TONES[index % AVATAR_TONES.length],
      }}
    >
      {showImage ? (
        <Image
          src={avatarUrl!}
          alt={name}
          width={size}
          height={size}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(avatarUrl ?? null)}
          className="size-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}

export function NeoDialog({
  open,
  onOpenChange,
  title,
  eyebrow,
  description,
  children,
  locked = false,
  accent = 'bg-lav',
  maxWidth = 'max-w-xl',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  eyebrow?: string
  description?: string
  children: React.ReactNode
  locked?: boolean
  accent?: string
  maxWidth?: string
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (locked && !next) return
        onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px] transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-3 sm:p-6">
          <Dialog.Popup
            className={cn(
              'relative my-auto w-full overflow-hidden rounded-[28px] border-2 border-ink bg-cream shadow-neo-lg outline-none transition duration-200 data-[ending-style]:translate-y-4 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-4 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              maxWidth,
            )}
          >
            <header className={cn('relative border-b-2 border-ink px-5 py-5 sm:px-7', accent)}>
              <div className="dots-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {eyebrow && (
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em]">{eyebrow}</p>
                  )}
                  <Dialog.Title className="font-display-tight text-2xl font-black sm:text-3xl">
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className="mt-2 text-sm leading-relaxed">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
                {!locked && (
                  <Dialog.Close
                    aria-label="Close"
                    className="neo-press grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper shadow-neo-sm outline-none focus-visible:ring-4 focus-visible:ring-ink/30"
                  >
                    <X className="size-4" strokeWidth={3} />
                  </Dialog.Close>
                )}
              </div>
            </header>
            <div className="px-5 py-6 sm:px-7">{children}</div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  htmlFor: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[11px] font-bold uppercase tracking-[0.14em]">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-bold text-[#c8260e]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export const inputClass =
  'h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 text-sm font-medium shadow-neo-sm outline-none transition placeholder:text-ink/40 focus:shadow-neo focus:-translate-x-0.5 focus:-translate-y-0.5 aria-[invalid=true]:bg-[#ffe1db]'
