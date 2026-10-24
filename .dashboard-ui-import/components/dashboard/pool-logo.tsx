'use client'

import { useState } from 'react'
import { getInitials } from '@/lib/dashboard/pool-utils'
import { cn } from '@/lib/utils'

export function PoolLogo({
  name,
  logoUrl,
  className,
}: {
  name: string
  logoUrl?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(logoUrl) && !failed

  return (
    <span
      className={cn(
        'flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-foreground bg-white text-sm font-extrabold text-foreground',
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={(img) => {
            if (img?.complete && img.naturalWidth === 0) setFailed(true)
          }}
          src={logoUrl}
          alt=""
          className="size-[55%] object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}
