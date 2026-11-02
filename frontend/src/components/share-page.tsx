'use client'

import { Wizard } from '@/components/share-plan/wizard'
import type { CreatePoolPayload, CreatePoolResult } from '@/lib/pool'

export type LaunchPlanDetails = {
  name: string
  price: number
  limit: number
  isPrivate: boolean
  tier?: string
  logoUrl?: string
  hostUpiId?: string
  billingCycle?: string
  planMonths?: number
  planDays?: number
  monthlyPrice?: number
  credentials?: {
    username?: string
    password?: string
    inviteLink?: string
  }
}

export type CreatedPoolResult = {
  poolId: string
  status: string
  totalSeats: number
  openSeats: number
  totalCost: number
  pricePerSeat: number
  inviteUrl: string | null
}

function toDetails(payload: CreatePoolPayload): LaunchPlanDetails {
  const totalSeats = payload.memberLimit + 1
  return {
    name: payload.planName,
    price: Math.round(payload.monthlyPrice / totalSeats),
    limit: payload.memberLimit,
    isPrivate: payload.visibility === 'private',
    tier: payload.tier ?? undefined,
    logoUrl: payload.logoUrl ?? undefined,
    hostUpiId: payload.hostUpi,
    billingCycle:
      payload.billingCycle === 'days'
        ? 'Days'
        : payload.billingCycle === 'yearly'
          ? 'Yearly'
          : 'Monthly',
    planMonths: payload.planMonths > 0 ? payload.planMonths : undefined,
    planDays: payload.billingCycle === 'days' && payload.planDays > 0 ? payload.planDays : undefined,
    monthlyPrice: payload.monthlyPrice,
    credentials:
      payload.credentials.method === 'login'
        ? { username: payload.credentials.username, password: payload.credentials.password }
        : { inviteLink: payload.credentials.inviteLink },
  }
}

export function SharePage({
  onBack,
  onLaunch,
}: {
  dark?: boolean
  onBack: () => void
  onLaunch?: (details: LaunchPlanDetails) => Promise<CreatedPoolResult | void> | CreatedPoolResult | void
}) {
  const handleLaunch = onLaunch
    ? async (payload: CreatePoolPayload): Promise<CreatePoolResult | void> => {
        const result = await onLaunch(toDetails(payload))
        if (!result) return
        return {
          ...result,
          status: 'OPEN',
        }
      }
    : undefined

  return <Wizard onBack={onBack} onLaunch={handleLaunch} />
}
