'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { neoFocus, neoLift } from '@/lib/dashboard/neo'
import { cn } from '@/lib/utils'

interface QuickAction {
  title: string
  description: string
  href: string
  onClick?: () => void
  image: string
  imageAlt: string
  className: string
}

export function QuickActions({
  joinHref,
  shareHref,
  onJoin,
  onShare,
}: {
  joinHref: string
  shareHref: string
  onJoin?: () => void
  onShare?: () => void
}) {
  const actions: QuickAction[] = [
    {
      title: 'Join a subscription',
      description: 'Match into a secure shared plan with escrow protection.',
      href: joinHref,
      onClick: onJoin,
      image: '/illustrations/neo-join.png',
      imageAlt: 'A hand placing a ticket into the open fourth seat of a shared plan',
      className: 'bg-mint',
    },
    {
      title: 'Share a subscription',
      description: 'List your plan safely and route automated UPI payouts.',
      href: shareHref,
      onClick: onShare,
      image: '/illustrations/neo-share.png',
      imageAlt: 'A subscription card shared by link with three happy members',
      className: 'bg-blush',
    },
  ]

  return (
    <section
      aria-label="Quick actions"
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1"
    >
      {actions.map((action, index) => {
        const inner = (
          <>
            <span className="relative block aspect-[16/9] overflow-hidden border-b-2 border-foreground bg-white">
              <Image
                src={action.image}
                alt={action.imageAlt}
                fill
                sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </span>
            <span className="flex items-start justify-between gap-4 p-4">
              <span>
                <span className="block text-lg font-extrabold leading-tight tracking-tight">
                  {action.title}
                </span>
                <span className="mt-1.5 block text-sm font-medium leading-relaxed text-foreground/80">
                  {action.description}
                </span>
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-foreground text-background transition-colors group-hover:bg-sun group-hover:text-foreground">
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </span>
            </span>
          </>
        )
        const cls = cn(
          'group block overflow-hidden rounded-3xl border-2 border-foreground',
          action.className,
          neoLift,
          neoFocus,
        )
        return (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.07, duration: 0.35 }}
          >
            {action.onClick ? (
              <button type="button" onClick={action.onClick} className={cls}>
                {inner}
              </button>
            ) : (
              <Link href={action.href} className={cls}>
                {inner}
              </Link>
            )}
          </motion.div>
        )
      })}
    </section>
  )
}
