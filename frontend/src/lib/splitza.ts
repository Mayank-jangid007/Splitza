export type Category =
  | 'Entertainment'
  | 'Music'
  | 'Cloud'
  | 'Education'
  | 'Games'
  | 'Others'

export const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Entertainment',
  'Music',
  'Cloud',
  'Education',
  'Games',
  'Others',
]

export type PlatformInfo = {
  key: string
  label: string
  logo: string
  tint: string
  category: Category
}

const PLATFORMS: { match: string[]; info: PlatformInfo }[] = [
  { match: ['netflix'], info: { key: 'netflix', label: 'Netflix', logo: '/logos/netflix.svg', tint: '#ffd3cc', category: 'Entertainment' } },
  { match: ['disney', 'hotstar'], info: { key: 'disney', label: 'Disney+', logo: '/logos/disney-plus.svg', tint: '#c9d8ff', category: 'Entertainment' } },
  { match: ['youtube'], info: { key: 'youtube', label: 'YouTube', logo: '/logos/youtube.svg', tint: '#ffd3cc', category: 'Entertainment' } },
  { match: ['spotify'], info: { key: 'spotify', label: 'Spotify', logo: '/logos/spotify.svg', tint: '#c8f5d8', category: 'Music' } },
  { match: ['apple music'], info: { key: 'apple-music', label: 'Apple Music', logo: '/logos/apple-music.svg', tint: '#ffd1de', category: 'Music' } },
  { match: ['google one', 'google drive', 'drive'], info: { key: 'drive', label: 'Google One', logo: '/logos/google-drive.svg', tint: '#fff2b3', category: 'Cloud' } },
  { match: ['icloud'], info: { key: 'icloud', label: 'iCloud+', logo: '/logos/icloud.svg', tint: '#d4e6ff', category: 'Cloud' } },
  { match: ['duolingo'], info: { key: 'duolingo', label: 'Duolingo', logo: '/logos/duolingo.svg', tint: '#d6f7b9', category: 'Education' } },
  { match: ['coursera'], info: { key: 'coursera', label: 'Coursera', logo: '/logos/coursera.svg', tint: '#cfe0ff', category: 'Education' } },
  { match: ['xbox', 'game pass'], info: { key: 'xbox', label: 'Xbox Game Pass', logo: '/logos/xbox.svg', tint: '#d5f5c9', category: 'Games' } },
  { match: ['playstation', 'ps plus', 'psn'], info: { key: 'ps', label: 'PlayStation Plus', logo: '/logos/playstation.svg', tint: '#cfe0ff', category: 'Games' } },
  { match: ['notion'], info: { key: 'notion', label: 'Notion', logo: '/logos/notion.svg', tint: '#ece7dc', category: 'Others' } },
  { match: ['canva'], info: { key: 'canva', label: 'Canva', logo: '/logos/canva.svg', tint: '#d9ccff', category: 'Others' } },
  { match: ['adobe', 'creative cloud'], info: { key: 'adobe', label: 'Adobe', logo: '/logos/adobe.svg', tint: '#ffd3cc', category: 'Others' } },
  { match: ['chatgpt', 'openai'], info: { key: 'openai', label: 'ChatGPT', logo: '/logos/openai.svg', tint: '#d7f0e6', category: 'Others' } },
]

export function detectPlatform(name: string): PlatformInfo | null {
  const q = name.trim().toLowerCase()
  if (!q) return null
  const hit = PLATFORMS.find((p) => p.match.some((m) => q.includes(m)))
  return hit ? hit.info : null
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export const ESCROW_STEPS = [
  { title: 'Funds locked', hint: 'Member payments are held safely in escrow.' },
  { title: 'Credentials shared', hint: 'Login details unlock once payment is verified.' },
  { title: 'Plan active', hint: 'Everyone is streaming, listening, learning.' },
  { title: 'Payout released', hint: 'Host is paid after the protection window.' },
] as const

export type Pool = {
  id: string
  name: string
  host: string
  role: 'hosted' | 'joined'
  visibility: 'public' | 'private'
  seats: number
  filled: number
  daysLeft: number
  totalDays: number
  pricePerSeat: number
  durationMonths: number
  durationDays?: number
  stepsDone: 0 | 1 | 2 | 3 | 4
  members: string[]
  inviteCode?: string
}

export type MarketPool = {
  id: string
  name: string
  host: string
  trust: number
  pricePerSeat: number
  durationMonths: number
  durationDays?: number
  seats: number
  filled: number
  category: Category
}

export const SEED_POOLS: Pool[] = []
export const SEED_MARKET: MarketPool[] = []
export const CURRENT_USER = ''
export const CURRENT_EMAIL = ''

export function pricePerSeat(monthly: number, seats: number, durationMonths: number) {
  if (!monthly || !seats || monthly <= 0 || seats <= 0) return 0
  return Math.ceil((monthly / seats) * durationMonths)
}

export function countPools(pools: Pool[]) {
  return pools.length
}

export function countOpenSeats(pools: Pool[]) {
  return pools
    .filter((p) => p.role === 'hosted')
    .reduce((sum, p) => sum + Math.max(p.seats - p.filled, 0), 0)
}

const UPI_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/
export const isValidUpi = (v: string) => UPI_PATTERN.test(v.trim())

export const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`

export function durationLabel(months: number) {
  if (months === 1) return '1 month'
  if (months === 12) return '1 year'
  return `${months} months`
}

export function planDurationLabel(pool: { durationMonths: number; durationDays?: number }) {
  const days = pool.durationDays
  const fullMonthDays = pool.durationMonths * 30
  if (days && days > 0 && days !== fullMonthDays) {
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }
  return durationLabel(pool.durationMonths)
}

export function makeInviteCode(name: string) {
  const prefix = name.replace(/[^a-z]/gi, '').slice(0, 3).toLowerCase() || 'spl'
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function credentialsFor(pool: { name: string; host: string }) {
  const handle = pool.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
  return {
    username: `${handle}@splitza.in`,
    password: `Sp!${pool.host.replace(/[^a-z]/gi, '').slice(0, 4).toLowerCase()}-${pool.name.length * 731}x`,
  }
}
