'use client'

import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  dark,
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  dark: boolean
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border-2 p-8 text-center sm:p-12',
        dark
          ? 'border-[var(--dash-border)] bg-[var(--dash-surface)]'
          : 'border-[var(--dash-border)] bg-[var(--dash-surface)]',
      )}
    >
      <div
        className={cn(
          'mb-6 grid size-16 place-items-center rounded-2xl',
          dark
            ? 'bg-[var(--dash-lime)] text-[var(--dash-lime-ink)]'
            : 'bg-[var(--dash-lime)] text-[var(--dash-lime-ink)]',
        )}
      >
        <Icon size={32} strokeWidth={1.5} />
      </div>

      <h3 className={cn('text-lg font-bold', dark ? 'text-[var(--dash-ink)]' : 'text-[var(--dash-ink)]')}>
        {title}
      </h3>

      {description && (
        <p className={cn('mt-2 max-w-xs text-sm', dark ? 'text-[var(--dash-ink-soft)]' : 'text-[var(--dash-ink-soft)]')}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          onClick={onAction}
          className={cn(
            'mt-6 rounded-2xl px-6 py-3 text-sm font-bold transition',
            dark
              ? 'bg-[var(--dash-ink)] text-[var(--dash-canvas)] hover:bg-[var(--dash-ink)]/90'
              : 'bg-[var(--dash-ink)] text-[var(--dash-canvas)] hover:bg-[var(--dash-ink)]/90',
          )}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
