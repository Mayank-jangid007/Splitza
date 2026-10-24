import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PoolSearch({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  className?: string
}) {
  return (
    <label
      className={cn(
        'flex h-12 items-center gap-3 rounded-2xl border-2 border-foreground bg-white px-4 shadow-brutal-sm transition-[transform,box-shadow] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-brutal',
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <Search className="size-5 shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-foreground/50 [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
  )
}
