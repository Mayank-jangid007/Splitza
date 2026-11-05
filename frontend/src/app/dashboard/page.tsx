"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SharePage, type LaunchPlanDetails } from "@/components/share-page";
import { poolsApi, type Pool as ApiPool } from "@/lib/api";
import { Marketplace } from "@/components/splitza/marketplace";
import { PoolsSection } from "@/components/splitza/pools-section";
import { Home } from "@/components/splitza/home";
import { PoolDetailsDialog } from "@/components/dashboard/pool-details-dialog";
import { useAuth } from "@/context/AuthContext";
import type { Pool as SplitzaPool } from "@/lib/splitza";
import type { DashboardRoutes, EscrowStep, Pool } from "@/lib/dashboard/types";

// ---------------------------------------------------------------------------
// Adapter: backend ApiPool → UI Pool
// ---------------------------------------------------------------------------

function getPlanLifespan(
  planMonths: number,
  startDate?: string,
  planDays?: number | null,
): { daysLeft: number; totalDays: number; endsOn: string } {
  const totalDays = planDays && planDays > 0 ? planDays : planMonths * 30;
  if (!startDate) return { daysLeft: totalDays, totalDays, endsOn: "—" };
  const start = new Date(startDate);
  const end = new Date(start.getTime() + totalDays * 86_400_000);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
  const endsOn = end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return { daysLeft, totalDays, endsOn };
}

function computeEscrowStep(pool: ApiPool): EscrowStep {
  if (pool.status === "ACTIVE" && (pool.filledSeats ?? 0) >= pool.maxSeats) return 3;
  if (pool.status === "ACTIVE") return 2;
  if (pool.status === "COMPLETED") return 4;
  return 1;
}

const LOGO_MAP: Record<string, string> = {
  netflix: "https://cdn.simpleicons.org/netflix/E50914",
  spotify: "https://cdn.simpleicons.org/spotify/1ED760",
  youtube: "https://cdn.simpleicons.org/youtube/FF0000",
  apple: "https://cdn.simpleicons.org/apple/000000",
  canva: "https://cdn.simpleicons.org/canva/00C4CC",
};

/**
 * The countdown must start from the moment the current user created or joined
 * the pool — not from `pool.startDate`, which is only set once the pool fills.
 */
function poolStartDate(p: ApiPool): string | undefined {
  if (p.role === "HOST") return p.createdAt ?? p.startDate;
  return p.joinedAt ?? p.startDate ?? p.createdAt;
}

function apiPoolToUIPool(p: ApiPool): Pool {
  const poolName = p.name || p.platformName || "Platform Plan";
  const logoKey = Object.keys(LOGO_MAP).find((k) => poolName.toLowerCase().includes(k));
  const { daysLeft, totalDays, endsOn } = getPlanLifespan(p.planMonths, poolStartDate(p), p.planDays);
  return {
    id: p.id,
    name: poolName,
    logoUrl: logoKey ? LOGO_MAP[logoKey] : undefined,
    host: p.host || p.hostName || "Host",
    role: p.role === "HOST" ? "host" : "member",
    isPrivate: p.visibility === "PRIVATE",
    capacity: p.maxSeats,
    filledSeats: p.filledSeats ?? 0,
    daysLeft,
    totalDays,
    endsOn,
    pricePerSeat: p.pricePerSeat,
    planMonths: p.planMonths,
    monthlyPlanCost: p.monthlyPlanCost,
    escrowStep: computeEscrowStep(p),
    inviteUrl: p.inviteUrl,
  };
}

function apiPoolToSplitzaPool(p: ApiPool): SplitzaPool {
  const poolName = p.name || p.platformName || "Platform Plan";
  const { daysLeft, totalDays } = getPlanLifespan(p.planMonths, poolStartDate(p), p.planDays);
  return {
    id: p.id,
    name: poolName,
    host: p.role === "HOST" ? "You" : p.host || p.hostName || "Host",
    role: p.role === "HOST" ? "hosted" : "joined",
    visibility: p.visibility === "PRIVATE" ? "private" : "public",
    seats: p.maxSeats,
    filled: p.filledSeats ?? 0,
    daysLeft,
    totalDays,
    pricePerSeat: p.pricePerSeat,
    durationMonths: p.planMonths ?? 1,
    durationDays: p.planDays && p.planDays > 0 ? p.planDays : undefined,
    stepsDone: computeEscrowStep(p),
    members: [],
    inviteCode: p.inviteUrl,
  };
}

// ---------------------------------------------------------------------------
// Dashboard routes — callbacks replace hrefs for the existing state machine
// ---------------------------------------------------------------------------
const ROUTES: DashboardRoutes = {
  home: "/",
  marketplace: "/dashboard#marketplace",
  myPools: "/dashboard",
  createPlan: "/dashboard#create",
  sharePlan: "/dashboard#create",
  ledger: "/ledger",
  pool: "/pools/:id",
  invites: "/pools/:id/invites",
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const userName = user?.name?.split(" ")[0] ?? "there";
  const userEmail = user?.email ?? "you@splitza.app";
  const userAvatarUrl = user?.avatarUrl ?? null;

  const [isSharing, setIsSharing] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [pools, setPools] = useState<ApiPool[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wantsMarket = params.get("view") === "market";
    const wantsCreate = params.get("create") === "1" || params.get("share") === "1";
    if (!wantsMarket && !wantsCreate) return;
    if (wantsMarket) setIsBrowsing(true);
    if (wantsCreate) setIsSharing(true);
    router.replace("/dashboard", { scroll: false });
  }, [router]);

  const fetchPools = useCallback(async () => {
    setPoolsLoading(true);
    try {
      const myRes = await poolsApi.getMyPools();
      if (myRes.ok) setPools(myRes.data);
    } catch (e) {
      console.error("Failed to load plans from backend", e);
    } finally {
      setPoolsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't redirect until AuthContext has finished restoring/loading
    if (loading) return;
    if (!user) {
      router.push("/landing");
      return;
    }
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchPools();
    }
  }, [loading, user, router, fetchPools]);

  const handleLaunch = async (details: LaunchPlanDetails) => {
    const upi = details.hostUpiId?.trim() ?? "";
    if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upi)) {
      throw new Error(`Invalid UPI ID "${upi || "(empty)"}". Use a format like yourname@okaxis.`);
    }

    const seats = details.limit + 1;
    const monthlyPrice = details.monthlyPrice ?? details.price * Math.max(1, details.limit);
    const planDays = details.planDays ?? (details.planMonths ?? 1) * 30;
    const planMonths = Math.max(1, Math.ceil(planDays / 30));
    const totalPlanCostINR = Math.max(1, Math.round((monthlyPrice / 30) * planDays));
    const pricePerSeat = Math.max(1, Math.round(totalPlanCostINR / seats));

    let created: Awaited<ReturnType<typeof poolsApi.create>>;
    try {
      created = await poolsApi.create({
        serviceType: "CUSTOM",
        customName: details.name,
        totalPlanCostINR,
        totalSeats: seats,
        planMonths,
        planDays,
        monthlyPlanCost: monthlyPrice,
        visibility: details.isPrivate ? "PRIVATE" : "PUBLIC",
        hostUpiId: upi,
        credentials: details.credentials,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create pool. Please try again.";
      throw new Error(message);
    }

    await fetchPools();
    return {
      poolId: created.data?.poolId ?? "",
      status: created.data?.status ?? "OPEN",
      totalSeats: seats,
      openSeats: Math.max(seats - 1, 0),
      totalCost: totalPlanCostINR,
      pricePerSeat: created.data?.pricePerSeat ?? pricePerSeat,
      inviteUrl: created.data?.inviteUrl ?? null,
    };
  };

  const handleUpdateVisibility = async (pool: Pool, isPublic: boolean) => {
    await poolsApi.updateVisibility(pool.id, isPublic ? "PUBLIC" : "PRIVATE");
    await fetchPools();
  };

  const handleDeletePool = async (pool: Pool) => {
    await poolsApi.remove(pool.id);
    setSelectedPool(null);
    await fetchPools();
  };

  const handleOpenPool = (pool: SplitzaPool) => {
    const raw = pools.find((item) => item.id === pool.id);
    if (raw) setSelectedPool(apiPoolToUIPool(raw));
  };

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-ink/20 border-t-ink" />
          <p className="text-sm font-bold text-ink/60">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (isSharing) {
    return (
      <SharePage
        dark={false}
        onBack={() => {
          void fetchPools();
          setIsBrowsing(false);
          setIsSharing(false);
        }}
        onLaunch={handleLaunch}
      />
    );
  }

  return (
    <div className="min-h-screen font-neo-body">
      <Home
        userName={userName}
        email={userEmail}
        avatarUrl={userAvatarUrl}
        view={isBrowsing ? "market" : "pools"}
        onView={(view) => setIsBrowsing(view === "market")}
        onShare={() => setIsSharing(true)}
        onBrowse={() => setIsBrowsing(true)}
        onProfile={() => {
          router.push('/profile')
        }}
        onFaq={() => {
          router.push('/faq')
        }}
        onFeedback={() => {
          router.push('/feedback')
        }}
        onLogout={logout}
      >
        {isBrowsing ? (
          <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-10 sm:px-8 sm:pt-14 sm:pb-24">
            <Marketplace
              onCreatePlan={() => {
                setIsBrowsing(false);
                setIsSharing(true);
              }}
              onJoin={() => {
                void fetchPools();
              }}
              onDone={() => {
                void fetchPools();
                setIsBrowsing(false);
              }}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-8 sm:pb-24">
            {poolsLoading ? (
              <div className="grid gap-6 lg:grid-cols-2" aria-busy="true" aria-label="Loading pools">
                {[0, 1].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-3xl border-2 border-ink/40 bg-paper/70" />
                ))}
              </div>
            ) : (
              <PoolsSection
                pools={pools.map(apiPoolToSplitzaPool)}
                onOpenPool={handleOpenPool}
                onShare={() => setIsSharing(true)}
                onBrowse={() => setIsBrowsing(true)}
              />
            )}
          </div>
        )}
      </Home>

      <PoolDetailsDialog
        pool={selectedPool}
        routes={ROUTES}
        onClose={() => setSelectedPool(null)}
        onUpdateVisibility={handleUpdateVisibility}
        onDelete={handleDeletePool}
      />

    </div>
  );
}
