"use client";

import { useEffect, useState } from "react";
import { SharePage, type LaunchPlanDetails } from "@/components/share-page";
import { type MarketplacePool } from "@/components/marketplace-view";
import { poolsApi, type Pool as ApiPool } from "@/lib/api";
import { HostPlanDetails, type Service } from "@/components/hosted-plans";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { Marketplace } from "@/components/splitza/marketplace";
import { EscrowFlow } from "@/components/escrow/escrow-flow";
import { useAuth } from "@/context/AuthContext";
import type { Pool, DashboardRoutes, EscrowStep } from "@/lib/dashboard/types";
import { Check, Copy, Lock, MessageCircle, Send } from "lucide-react";

// ---------------------------------------------------------------------------
// Adapter: backend ApiPool / Service → UI Pool
// ---------------------------------------------------------------------------

function getPlanLifespan(planMonths: number, startDate?: string): { daysLeft: number; totalDays: number; endsOn: string } {
  const totalDays = planMonths * 30;
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

function apiPoolToUIPool(p: ApiPool, role: "host" | "member" = "host"): Pool {
  const poolName = p.name || p.platformName || "Platform Plan";
  const logoKey = Object.keys(LOGO_MAP).find((k) => poolName.toLowerCase().includes(k));
  const { daysLeft, totalDays, endsOn } = getPlanLifespan(p.planMonths, p.startDate);
  return {
    id: p.id,
    name: poolName,
    logoUrl: logoKey ? LOGO_MAP[logoKey] : undefined,
    host: p.host || p.hostName || "Host",
    role,
    isPrivate: p.visibility === "PRIVATE",
    capacity: p.maxSeats,
    filledSeats: p.filledSeats ?? 0,
    daysLeft,
    totalDays,
    endsOn,
    pricePerSeat: p.pricePerSeat,
    planMonths: p.planMonths,
    escrowStep: computeEscrowStep(p),
  };
}

function serviceToUIPool(s: Service, id: string): Pool {
  const { daysLeft, totalDays, endsOn } = getPlanLifespan(s.planMonths ?? 1, s.startDate);
  const role: "host" | "member" = s.host === "You" ? "host" : "member";
  return {
    id,
    name: s.name,
    logoUrl: s.logoUrl,
    host: s.host,
    role,
    isPrivate: s.private,
    capacity: s.capacity,
    filledSeats: s.filled,
    daysLeft,
    totalDays,
    endsOn,
    pricePerSeat: s.price,
    planMonths: s.planMonths ?? 1,
    escrowStep: 1,
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
  const { user, logout } = useAuth();
  const userName = user?.name?.split(" ")[0] ?? "You";

  const [isSharing, setIsSharing] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [joiningPool, setJoiningPool] = useState<MarketplacePool | null>(null);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [activeShareService, setActiveShareService] = useState<Service | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const myRes = await poolsApi.getMyPools();
        if (myRes.ok) {
          const mapPool = (p: ApiPool): Service => {
            const poolName = p.name || p.platformName || "Platform Plan";
            const logoKey = Object.keys(LOGO_MAP).find((k) => poolName.toLowerCase().includes(k));
            return {
              name: poolName,
              host: p.role === "HOST" ? "You" : (p.host || p.hostName || "Host"),
              price: p.pricePerSeat,
              capacity: p.maxSeats,
              filled: p.filledSeats || 0,
              private: p.visibility === "PRIVATE",
              brand: poolName.substring(0, 2).toUpperCase(),
              logoUrl: logoKey ? LOGO_MAP[logoKey] : undefined,
              accent: p.visibility === "PRIVATE" ? "bg-violet-400" : "bg-emerald-400",
              planMonths: p.planMonths,
              startDate: p.startDate,
            };
          };
          setMyServices(myRes.data.map(mapPool));
        }
      } catch (e) {
        console.error("Failed to load plans from backend", e);
      }
    };
    fetchPools();
  }, []);

  const handleLaunch = async (details: LaunchPlanDetails) => {
    // UPI is pre-validated in share-page before this is called,
    // but double-check here as a safety net.
    const upi = details.hostUpiId?.trim() ?? ""
    if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upi)) {
      throw new Error(`Invalid UPI ID "${upi || "(empty)"}". Use a format like yourname@okaxis.`)
    }

    setIsCreating(true);
    try {
      await poolsApi.create({
        serviceType: "CUSTOM",
        customName: details.name,
        totalPlanCostINR: details.price * (details.limit + 1),
        totalSeats: details.limit + 1,
        planMonths: 1,
        visibility: details.isPrivate ? "PRIVATE" : "PUBLIC",
        hostUpiId: upi,
        credentials: details.credentials,
      });

      const newService: Service = {
        name: details.name,
        host: "You",
        price: details.price,
        capacity: details.limit + 1,
        filled: 1,
        private: details.isPrivate,
        brand: details.name.substring(0, 2).toUpperCase(),
        logoUrl: details.logoUrl,
        accent: details.isPrivate ? "bg-violet-400" : "bg-emerald-400",
        planMonths: 1,
      };

      setMyServices((prev) => [newService, ...prev]);
      setIsSharing(false);
      if (details.isPrivate) setActiveShareService(newService);
    } catch (e: any) {
      // Re-throw so share-page's launchError state can display it inline
      throw new Error(e?.message ?? "Failed to create pool. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://subsplit.in");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Convert Service[] → Pool[] for the new UI
  const uiPools: Pool[] = myServices.map((s, i) => serviceToUIPool(s, `pool-${i}-${s.name}`));

  // Full-screen overlay views
  if (isSharing) {
    return <SharePage dark={false} onBack={() => setIsSharing(false)} onLaunch={handleLaunch} />;
  }

  if (activeService) {
    return (
      <HostPlanDetails
        service={activeService}
        dark={false}
        onBack={() => setActiveService(null)}
        onShare={() => {
          setActiveService(null);
          setIsSharing(true);
        }}
      />
    );
  }

  return (
    <>
      <DashboardView
        pools={uiPools}
        userName={userName}
        routes={{
          ...ROUTES,
          marketplace: "#marketplace",
          createPlan: "#create",
          sharePlan: "#create",
        }}
        onBrowseMarketplace={() => setIsBrowsing(true)}
        onMyPools={() => setIsBrowsing(false)}
        onCreatePlan={() => setIsSharing(true)}
        onSharePlan={() => setIsSharing(true)}
        onLogout={logout}
        onOpenWallet={() => {/* TODO: open wallet */}}
        onOpenFeedback={() => {/* TODO: open feedback */}}
        isBrowsing={isBrowsing}
        marketplaceContent={isBrowsing ? (
          <Marketplace
            onCreatePlan={() => { setIsBrowsing(false); setIsSharing(true); }}
            onJoin={(pool) => { setIsBrowsing(false); setJoiningPool(pool); }}
          />
        ) : undefined}
      />

      <EscrowFlow
        pool={joiningPool}
        onClose={() => { setJoiningPool(null); setIsBrowsing(true); }}
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
    </>
  );
}
