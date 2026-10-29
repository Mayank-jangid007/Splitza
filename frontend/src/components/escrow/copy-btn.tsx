'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyBtnProps {
  value: string
  label?: string
  className?: string
}

export function CopyBtn({ value, label = 'Copy', className }: CopyBtnProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#151515] bg-white px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_0_#151515] transition-colors hover:bg-[#f7c85a] ${className ?? ''}`}
    >
      {copied ? <Check className="size-3.5" strokeWidth={3} /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
