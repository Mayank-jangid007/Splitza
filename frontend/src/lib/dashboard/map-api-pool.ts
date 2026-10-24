import type { Pool as ApiPool } from "@/lib/api";
import { resolveLogoUrl } from "@/lib/logos";
import type { EscrowStep, Pool as DashboardPool, PoolAccent } from "./types";

const ACCENTS: PoolAccent[] = ["peach", "mint", "lilac", "sun", "blush"];

function hashAccent(id: string): PoolAccent {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return ACCENTS[n % ACCENTS.length];
}

function computeDaysLeft(startDate: string | undefined, totalDays: number): number {
  if (!startDate) return Math.round(totalDays * 0.65);
  const start = new Date(startDate).getTime();
  if (Number.isNaN(start)) return Math.round(totalDays * 0.65);
  const elapsed = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
  return Math.max(totalDays - elapsed, 0);
}

export function mapApiPoolToDashboard(p: ApiPool): DashboardPool {
  const name = p.name || p.platformName || "Platform Plan";
  const host = p.host || p.hostName || "You";
  const planMonths = p.planMonths || 1;
  const totalDays = planMonths * 30;
  const daysLeft = computeDaysLeft(p.startDate, totalDays);
  const filledSeats = p.filledSeats ?? 1;
  const escrowStep = Math.min(4, Math.max(1, Math.ceil((filledSeats / Math.max(p.maxSeats, 1)) * 3))) as EscrowStep;

  return {
    id: p.id,
    name,
    logoUrl: resolveLogoUrl(null, name) ?? undefined,
    host,
    role: "host",
    isPrivate: p.visibility === "PRIVATE",
    capacity: p.maxSeats,
    filledSeats,
    daysLeft,
    totalDays,
    pricePerSeat: p.pricePerSeat,
    planMonths,
    escrowStep,
    endsOn: "—",
    accent: hashAccent(p.id),
    poolCapital: p.pricePerSeat * p.maxSeats,
  };
}
