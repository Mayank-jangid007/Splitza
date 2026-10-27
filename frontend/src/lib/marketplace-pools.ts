export const CATEGORIES = [
  'Entertainment',
  'Music',
  'Cloud',
  'Education',
  'Games',
  'Others',
] as const

export type Category = (typeof CATEGORIES)[number]

export type Tone = 'sun' | 'bubble' | 'mint' | 'lilac' | 'peach' | 'sky'

export type MarketplacePoolFull = {
  id: string
  name: string
  service: string
  category: Category
  host: string
  hostHandle: string
  logo: string
  totalCost: number
  totalSeats: number
  seatsLeft: number
  daysLeft: number
  cycleDays: number
  tone: Tone
  perks: string[]
  description: string
  rules: string[]
  hostRating: number
  hostPools: number
}

const icon = (slug: string) =>
  `https://cdn.simpleicons.org/${slug}`

export const POOLS: MarketplacePoolFull[] = [
  {
    id: 'netflix-4k',
    name: 'Netflix Premium 4K',
    service: 'Netflix',
    category: 'Entertainment',
    host: 'Aarav Mehta',
    hostHandle: '@aarav.m',
    logo: 'https://cdn.simpleicons.org/netflix/E50914',
    totalCost: 649,
    totalSeats: 5,
    seatsLeft: 2,
    daysLeft: 24,
    cycleDays: 30,
    tone: 'sun',
    perks: ['Ultra HD 4K', '5 profiles', 'Downloads on 4 devices'],
    description: 'Running this household plan for 2 years now. Each member gets their own profile and PIN.',
    rules: [
      'Use only your assigned profile and do not change its PIN.',
      'One screen at a time per member.',
      'Pay your split within 3 days of the cycle start.',
    ],
    hostRating: 4.9,
    hostPools: 12,
  },
  {
    id: 'spotify-family',
    name: 'Spotify Premium Family',
    service: 'Spotify',
    category: 'Music',
    host: 'Riya Kapoor',
    hostHandle: '@riyak',
    logo: 'https://cdn.simpleicons.org/spotify/1DB954',
    totalCost: 179,
    totalSeats: 6,
    seatsLeft: 3,
    daysLeft: 18,
    cycleDays: 30,
    tone: 'mint',
    perks: ['Ad-free listening', 'Offline mode', 'Six individual accounts'],
    description: 'Family plan with an invite link for each member. You keep your own playlists.',
    rules: [
      'Accept the invite within 24 hours of joining.',
      'Keep the family address verified when Spotify asks.',
    ],
    hostRating: 4.8,
    hostPools: 7,
  },
  {
    id: 'disney-hotstar',
    name: 'Disney+ Hotstar Premium',
    service: 'Disney+',
    category: 'Entertainment',
    host: 'Kabir Singh',
    hostHandle: '@kabir_s',
    logo: 'https://cdn.simpleicons.org/disneyplus/113CCF',
    totalCost: 299,
    totalSeats: 4,
    seatsLeft: 1,
    daysLeft: 9,
    cycleDays: 30,
    tone: 'lilac',
    perks: ['Live sports', 'Originals and movies', '4 simultaneous screens'],
    description: 'Shared premium login with 4 screens. Great for IPL season and weekend movie nights.',
    rules: [
      'Max 1 active screen per member during live matches.',
      'No password changes.',
    ],
    hostRating: 4.7,
    hostPools: 5,
  },
  {
    id: 'google-one',
    name: 'Google One 2 TB',
    service: 'Google One',
    category: 'Cloud',
    host: 'Neha Iyer',
    hostHandle: '@neha.iyer',
    logo: 'https://cdn.simpleicons.org/google/4285F4',
    totalCost: 650,
    totalSeats: 5,
    seatsLeft: 4,
    daysLeft: 27,
    cycleDays: 30,
    tone: 'sky',
    perks: ['2 TB shared storage', 'Photos backup', 'Family sharing'],
    description: 'Shared 2 TB via Google Family Group. Your files stay private to your own account.',
    rules: [
      'Fair use: keep your usage under 400 GB.',
      'Use your own Google account to accept the family invite.',
    ],
    hostRating: 5.0,
    hostPools: 3,
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium Family',
    service: 'YouTube',
    category: 'Entertainment',
    host: 'Dev Malhotra',
    hostHandle: '@devm',
    logo: 'https://cdn.simpleicons.org/youtube/FF0000',
    totalCost: 299,
    totalSeats: 5,
    seatsLeft: 2,
    daysLeft: 14,
    cycleDays: 30,
    tone: 'peach',
    perks: ['No ads', 'Background play', 'YouTube Music included'],
    description: 'YouTube Premium family invites with YouTube Music included.',
    rules: [
      'Join with a Google account that is 13 years or older.',
      'Stay within the same country as the host.',
    ],
    hostRating: 4.6,
    hostPools: 9,
  },
  {
    id: 'duolingo-super',
    name: 'Duolingo Super Family',
    service: 'Duolingo',
    category: 'Education',
    host: 'Ishita Rao',
    hostHandle: '@ishita',
    logo: 'https://cdn.simpleicons.org/duolingo/58CC02',
    totalCost: 599,
    totalSeats: 6,
    seatsLeft: 3,
    daysLeft: 21,
    cycleDays: 30,
    tone: 'mint',
    perks: ['Unlimited hearts', 'No ads', 'Progress insights'],
    description: 'Super Family slots for learners who want unlimited hearts.',
    rules: [
      'Accept the family invite from your own Duolingo account.',
    ],
    hostRating: 4.9,
    hostPools: 4,
  },
  {
    id: 'xbox-game-pass',
    name: 'Xbox Game Pass Ultimate',
    service: 'Xbox',
    category: 'Games',
    host: 'Rohan Das',
    hostHandle: '@rohan.plays',
    logo: 'https://cdn.simpleicons.org/xbox/107C10',
    totalCost: 549,
    totalSeats: 3,
    seatsLeft: 1,
    daysLeft: 6,
    cycleDays: 30,
    tone: 'mint',
    perks: ['100+ games', 'Cloud gaming', 'Online multiplayer'],
    description: 'Game Pass Ultimate on my primary console, so everyone gets the library.',
    rules: [
      'Only play on your own profile.',
      'Do not purchase anything using the host account.',
    ],
    hostRating: 4.5,
    hostPools: 8,
  },
  {
    id: 'notion-plus',
    name: 'Notion Plus Team',
    service: 'Notion',
    category: 'Others',
    host: 'Arjun Nair',
    hostHandle: '@arjun.n',
    logo: 'https://cdn.simpleicons.org/notion/000000',
    totalCost: 800,
    totalSeats: 4,
    seatsLeft: 2,
    daysLeft: 16,
    cycleDays: 30,
    tone: 'sun',
    perks: ['Unlimited blocks', 'Shared workspace', 'Version history'],
    description: 'Notion Plus workspace for freelancers and students.',
    rules: [
      'Keep your pages private unless you choose to share them.',
      'No client or confidential company data in the shared workspace.',
    ],
    hostRating: 4.8,
    hostPools: 3,
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro Team',
    service: 'Canva',
    category: 'Others',
    host: 'Meera Pillai',
    hostHandle: '@meerap',
    logo: 'https://cdn.simpleicons.org/canva/00C4CC',
    totalCost: 499,
    totalSeats: 5,
    seatsLeft: 3,
    daysLeft: 22,
    cycleDays: 30,
    tone: 'lilac',
    perks: ['Brand kit', 'Background remover', '100 GB storage'],
    description: 'Canva Pro Team seats for designers and creators.',
    rules: [
      'Do not delete shared brand kit assets.',
      'Use your own email to accept the team invite.',
    ],
    hostRating: 4.9,
    hostPools: 6,
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365 Family',
    service: 'Microsoft',
    category: 'Cloud',
    host: 'Karan Bedi',
    hostHandle: '@karanb',
    logo: 'https://cdn.simpleicons.org/microsoft/0078D4',
    totalCost: 999,
    totalSeats: 6,
    seatsLeft: 3,
    daysLeft: 20,
    cycleDays: 30,
    tone: 'sky',
    perks: ['Word, Excel, PowerPoint', '1 TB OneDrive each', '6 users'],
    description: 'Microsoft 365 Family plan shared across 6 accounts.',
    rules: [
      'Use your own Microsoft account.',
      'Keep OneDrive usage under 800 GB.',
    ],
    hostRating: 4.7,
    hostPools: 5,
  },
]

export function splitPrice(pool: MarketplacePoolFull) {
  return Math.ceil(pool.totalCost / pool.totalSeats)
}

export function formatINR(value: number) {
  return `₹${value.toLocaleString('en-IN')}`
}

export const toneClass: Record<Tone, string> = {
  sun: 'bg-sun',
  bubble: 'bg-bubble',
  mint: 'bg-mint',
  lilac: 'bg-lilac',
  peach: 'bg-peach',
  sky: 'bg-sky',
}
