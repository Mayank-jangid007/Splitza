"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SharePage, type LaunchPlanDetails } from "@/components/share-page";
import { type MarketplacePool } from "@/components/marketplace-view";
import { poolsApi, type Pool as ApiPool } from "@/lib/api";
import { type Service } from "@/components/hosted-plans";
import { Marketplace } from "@/components/splitza/marketplace";
import { PoolsSection } from "@/components/splitza/pools-section";
import { EscrowFlow } from "@/components/escrow/escrow-flow";
import { Home } from "@/components/splitza/home";
import { PoolDetailsDialog } from "@/components/dashboard/pool-details-dialog";
import { useAuth } from "@/context/AuthContext";
import type { Pool as SplitzaPool } from "@/lib/splitza";
import type { DashboardRoutes, EscrowStep, Pool } from "@/lib/dashboard/types";
import { Check, Copy, Lock, MessageCircle, Send } from "lucide-react";

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

function apiPoolToUIPool(p: ApiPool): Pool {
  const poolName = p.name || p.platformName || "Platform Plan";
  const logoKey = Object.keys(LOGO_MAP).find((k) => poolName.toLowerCase().includes(k));
  const { daysLeft, totalDays, endsOn } = getPlanLifespan(p.planMonths, p.startDate, p.planDays);
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
  const { daysLeft, totalDays } = getPlanLifespan(p.planMonths, p.startDate, p.planDays);
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

  const [isSharing, setIsSharing] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [joiningPool, setJoiningPool] = useState<MarketplacePool | null>(null);
  const [activeShareService, setActiveShareService] = useState<Service | null>(null);
  const [copied, setCopied] = useState(false);
  const [pools, setPools] = useState<ApiPool[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const fetchPools = useCallback(async () => {
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
    if (!loading && !user) {
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

    const newService: Service = {
      id: created.data?.poolId,
      inviteUrl: created.data?.inviteUrl,
      role: "host",
      name: details.name,
      host: "You",
      price: pricePerSeat,
      capacity: seats,
      filled: 1,
      private: details.isPrivate,
      brand: details.name.substring(0, 2).toUpperCase(),
      logoUrl: details.logoUrl,
      accent: details.isPrivate ? "bg-violet-400" : "bg-emerald-400",
      planMonths,
      planDays,
      monthlyPlanCost: monthlyPrice,
    };

    await fetchPools();
    setIsSharing(false);
    setActiveShareService(newService);
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

  const copyLink = () => {
    navigator.clipboard.writeText("https://subsplit.in");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isSharing) {
    return <SharePage dark={false} onBack={() => setIsSharing(false)} onLaunch={handleLaunch} />;
  }

  return (
    <div className="min-h-screen font-neo-body">
      <Home
        userName={userName}
        email={userEmail}
        view={isBrowsing ? "market" : "pools"}
        onView={(view) => setIsBrowsing(view === "market")}
        onShare={() => setIsSharing(true)}
        onBrowse={() => setIsBrowsing(true)}
        onWallet={() => {}}
        onLogout={logout}
      >
        {isBrowsing ? (
          <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-10 sm:px-8 sm:pt-14 sm:pb-24">
            <Marketplace
              onCreatePlan={() => {
                setIsBrowsing(false);
                setIsSharing(true);
              }}
              onJoin={(pool) => {
                setIsBrowsing(false);
                setJoiningPool(pool);
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

      <EscrowFlow
        pool={joiningPool}
        onClose={() => {
          setJoiningPool(null);
          setIsBrowsing(true);
        }}
        onJoinComplete={fetchPools}
      />

      {/* Private pool live popup — kept as-is from original */}
      {activeShareService && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/75 px-4 py-6 backdrop-blur-md">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="private-pool-title"
            className="w-full max-w-xl rounded-[2rem] border-[3px] border-black bg-black p-6 text-white shadow-[10px_10px_0_#34d399] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-none border-[3px] border-emerald-300 bg-emerald-300 text-black shadow-[4px_4px_0_#a78bfa]">
                  <Lock size={24} strokeWidth={3} />
                </span>
                <div>
                  <p className="font-mono text-[10px] font-black tracking-[.18em] text-emerald-300">PRIVATE CIRCLE MODE</p>
                  <h2 id="private-pool-title" className="mt-2 font-mono text-2xl font-black uppercase leading-tight tracking-[-.06em] sm:text-3xl">
                    Private Split Pool is Live!
                  </h2>
                </div>
              </div>
              <span className="hidden rounded-none border border-emerald-300/50 px-3 py-1 font-mono text-[9px] font-black tracking-widest text-emerald-300 sm:block">ACTIVE</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-none border-2 border-white/20 bg-black p-3 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 break-all px-2 font-mono text-sm text-white">https://subsplit.in</code>
              <button
                onClick={copyLink}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-none border-2 border-emerald-300 bg-emerald-300 px-4 py-2.5 font-mono text-[10px] font-black text-black transition hover:bg-white hover:border-white"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "COPIED!" : "COPY LINK"}
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-white/70">
              Your subscription is completely hidden from the public eye. Send this private portal link to your friends, family, or roommates. As soon as they click and authorize their monthly UPI AutoPay split, our escrow locker will seamlessly release their profile access codes and handle your monthly payouts automatically.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                aria-label="Share on WhatsApp"
                onClick={() => window.open("https://wa.me/?text=https%3A%2F%2Fsubsplit.in", "_blank", "noopener,noreferrer")}
                className="inline-flex items-center justify-center gap-3 rounded-none border-2 border-emerald-300/70 bg-black px-4 py-3 font-mono text-[10px] font-black text-white transition hover:bg-emerald-300 hover:text-black"
              >
                <MessageCircle size={18} strokeWidth={2.5} /> WHATSAPP
              </button>
              <button
                aria-label="Share on Telegram"
                onClick={() => window.open("https://t.me/share/url?url=https%3A%2F%2Fsubsplit.in", "_blank", "noopener,noreferrer")}
                className="inline-flex items-center justify-center gap-3 rounded-none border-2 border-amber-300/70 bg-black px-4 py-3 font-mono text-[10px] font-black text-white transition hover:bg-amber-300 hover:text-black"
              >
                <Send size={17} fill="currentColor" /> TELEGRAM
              </button>
            </div>

            <button
              onClick={() => setActiveShareService(null)}
              className="mt-8 w-full rounded-none border-[3px] border-emerald-300 bg-emerald-300 px-5 py-4 font-mono text-[11px] font-black text-black shadow-[4px_4px_0_#a78bfa] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-white hover:border-white"
            >
              GO TO MY LEDGER
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
