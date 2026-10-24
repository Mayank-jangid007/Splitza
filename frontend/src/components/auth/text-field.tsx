'use client'

import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { neoFocus } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  icon: ReactNode
  hint?: ReactNode
  error?: string
}

export function TextField({
  label,
  icon,
  hint,
  error,
  type = 'text',
  className,
  ...props
}: TextFieldProps) {
  const id = useId()
  const errorId = useId()
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/60 [&_svg]:size-5"
        >
          {icon}
        </span>
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-12 w-full rounded-xl border-2 border-foreground bg-white pl-11 text-base font-medium shadow-brutal-sm transition-[box-shadow,background-color] placeholder:text-foreground/40 focus-visible:bg-sun/20 focus-visible:shadow-brutal',
            isPassword ? 'pr-12' : 'pr-4',
            error && 'border-red-500',
            neoFocus,
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className={cn(
              'absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted',
              neoFocus,
            )}
          >
            {revealed ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
