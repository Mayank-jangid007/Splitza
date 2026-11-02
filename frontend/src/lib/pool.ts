export const DASHBOARD_HREF = '/dashboard'

export type BillingCycle = 'monthly' | 'yearly' | 'days'
export type Visibility = 'public' | 'private'
export type CredentialMethod = 'login' | 'invite'

export type OfficialPlan = {
  id: string
  name: string
  brand: string
  tier: string
  logo: string
  price: number
  memberLimit: number
  months: number
  tint: string
}

export const OFFICIAL_PLANS: OfficialPlan[] = [
  {
    id: 'netflix-premium',
    name: 'Netflix Premium 4K',
    brand: 'Netflix',
    tier: 'Premium',
    logo: '/logos/netflix.svg',
    price: 649,
    memberLimit: 4,
    months: 1,
    tint: 'bg-bubblegum',
  },
  {
    id: 'spotify-family',
    name: 'Spotify Family',
    brand: 'Spotify',
    tier: 'Family',
    logo: '/logos/spotify.svg',
    price: 179,
    memberLimit: 6,
    months: 1,
    tint: 'bg-mint',
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    brand: 'YouTube',
    tier: 'Premium',
    logo: '/logos/youtube.svg',
    price: 189,
    memberLimit: 5,
    months: 1,
    tint: 'bg-sun',
  },
  {
    id: 'apple-one',
    name: 'Apple One',
    brand: 'Apple',
    tier: 'Family',
    logo: '/logos/apple.svg',
    price: 365,
    memberLimit: 5,
    months: 1,
    tint: 'bg-lilac',
  },
  {
    id: 'canva-pro',
    name: 'Canva Pro',
    brand: 'Canva',
    tier: 'Teams',
    logo: '/logos/canva.svg',
    price: 499,
    memberLimit: 5,
    months: 1,
    tint: 'bg-sun-soft',
  },
]

export type PoolDraft = {
  mode: 'official' | 'custom' | null
  officialId: string | null
  customName: string
  customPrice: string
  billingCycle: BillingCycle
  months: number
  days: number
  memberLimit: number
  visibility: Visibility
  credentialMethod: CredentialMethod
  username: string
  password: string
  inviteLink: string
  upi: string
}

export const INITIAL_DRAFT: PoolDraft = {
  mode: null,
  officialId: null,
  customName: '',
  customPrice: '',
  billingCycle: 'monthly',
  months: 1,
  days: 30,
  memberLimit: 3,
  visibility: 'public',
  credentialMethod: 'login',
  username: '',
  password: '',
  inviteLink: '',
  upi: '',
}

export const LIMITS = {
  minPrice: 1,
  minMembers: 1,
  maxMembers: 12,
  minMonths: 1,
  maxMonths: 12,
  minDays: 1,
  maxDays: 365,
}

export function getOfficialPlan(draft: PoolDraft) {
  return OFFICIAL_PLANS.find((p) => p.id === draft.officialId) ?? null
}

export type PlanSummary = {
  name: string
  tier: string | null
  logo: string | null
  monthlyPrice: number
  memberLimit: number
  totalSeats: number
  billingCycle: BillingCycle
  planMonths: number
  planDays: number
  totalCost: number
  perSeat: number
  durationLabel: string
  totalDays: number
}

export function parsePrice(raw: string) {
  const n = Number(raw)
  return Number.isFinite(n) ? n : NaN
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function summarize(draft: PoolDraft): PlanSummary | null {
  const official = getOfficialPlan(draft)

  if (draft.mode === 'official' && official) {
    const totalSeats = official.memberLimit + 1
    const totalCost = official.price * official.months
    return {
      name: official.name,
      tier: official.tier,
      logo: official.logo,
      monthlyPrice: official.price,
      memberLimit: official.memberLimit,
      totalSeats,
      billingCycle: 'monthly',
      planMonths: official.months,
      planDays: 0,
      totalCost,
      perSeat: round2(totalCost / totalSeats),
      durationLabel: official.months === 1 ? '1 month' : `${official.months} months`,
      totalDays: official.months * 30,
    }
  }

  if (draft.mode === 'custom') {
    const price = parsePrice(draft.customPrice)
    const monthlyPrice = Number.isFinite(price) && price > 0 ? price : 0
    const memberLimit = draft.memberLimit
    const totalSeats = memberLimit + 1

    let months = 0
    let days = 0
    let totalCost = 0
    let durationLabel = ''
    let totalDays = 0

    if (draft.billingCycle === 'days') {
      days = draft.days
      totalCost = (monthlyPrice / 30) * days
      durationLabel = days === 1 ? '1 day' : `${days} days`
      totalDays = days
    } else {
      months = draft.billingCycle === 'yearly' ? 12 : draft.months
      totalCost = monthlyPrice * months
      durationLabel = months === 1 ? '1 month' : `${months} months`
      totalDays = months * 30
    }

    return {
      name: draft.customName.trim(),
      tier: null,
      logo: null,
      monthlyPrice,
      memberLimit,
      totalSeats,
      billingCycle: draft.billingCycle,
      planMonths: months,
      planDays: days,
      totalCost: round2(totalCost),
      perSeat: round2(totalCost / totalSeats),
      durationLabel,
      totalDays,
    }
  }

  return null
}

export function formatINR(n: number) {
  const hasFraction = Math.abs(n - Math.round(n)) > 0.001
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

export const UPI_PATTERN = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/

export function validateUpi(value: string) {
  const v = value.trim()
  if (!v) return 'UPI ID is required.'
  if (!UPI_PATTERN.test(v)) return 'Use the format name@bank, e.g. mayank@oksbi.'
  return null
}

export function validateInviteLink(value: string) {
  const v = value.trim()
  if (!v) return 'Invite link is required.'
  try {
    const url = new URL(v)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
    return null
  } catch {
    return 'Enter a valid link starting with https://'
  }
}

export function validateCustomName(value: string) {
  if (!value.trim()) return 'Give your subscription a name.'
  if (value.trim().length > 60) return 'Keep the name under 60 characters.'
  return null
}

export function validateCustomPrice(value: string) {
  if (!value.trim()) return 'Enter the monthly price.'
  const n = parsePrice(value)
  if (!Number.isFinite(n)) return 'Enter a valid number.'
  if (n < LIMITS.minPrice) return `Minimum price is ₹${LIMITS.minPrice}.`
  return null
}

export function isStepValid(step: number, draft: PoolDraft): boolean {
  switch (step) {
    case 0:
      return draft.mode === 'custom' || (draft.mode === 'official' && !!getOfficialPlan(draft))
    case 1:
      if (draft.mode === 'official') return !!getOfficialPlan(draft)
      return (
        !validateCustomName(draft.customName) &&
        !validateCustomPrice(draft.customPrice) &&
        draft.memberLimit >= LIMITS.minMembers &&
        draft.memberLimit <= LIMITS.maxMembers &&
        (draft.billingCycle === 'days'
          ? draft.days >= LIMITS.minDays && draft.days <= LIMITS.maxDays
          : draft.billingCycle === 'yearly' ||
            (draft.months >= LIMITS.minMonths && draft.months <= LIMITS.maxMonths))
      )
    case 2:
      return draft.visibility === 'public' || draft.visibility === 'private'
    case 3:
      return draft.credentialMethod === 'login'
        ? draft.username.trim().length > 0 && draft.password.length > 0
        : !validateInviteLink(draft.inviteLink)
    case 4:
      return !validateUpi(draft.upi)
    default:
      return false
  }
}

export type CreatePoolPayload = {
  planName: string
  monthlyPrice: number
  memberLimit: number
  visibility: Visibility
  tier: string | null
  logoUrl: string | null
  hostUpi: string
  billingCycle: BillingCycle
  planMonths: number
  planDays: number
  credentials:
    | { method: 'login'; username: string; password: string }
    | { method: 'invite'; inviteLink: string }
}

export function buildPayload(draft: PoolDraft): CreatePoolPayload | null {
  const s = summarize(draft)
  if (!s) return null
  return {
    planName: s.name,
    monthlyPrice: s.monthlyPrice,
    memberLimit: s.memberLimit,
    visibility: draft.visibility,
    tier: s.tier,
    logoUrl: s.logo,
    hostUpi: draft.upi.trim(),
    billingCycle: s.billingCycle,
    planMonths: s.planMonths,
    planDays: s.planDays,
    credentials:
      draft.credentialMethod === 'login'
        ? { method: 'login', username: draft.username.trim(), password: draft.password }
        : { method: 'invite', inviteLink: draft.inviteLink.trim() },
  }
}

export type CreatePoolResult = {
  poolId: string
  status: 'OPEN'
  totalSeats: number
  openSeats: number
  totalCost: number
  pricePerSeat: number
  inviteUrl: string | null
}
