"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SharePage, type LaunchPlanDetails } from "@/components/share-page";
import { MarketplaceView, type MarketplacePool } from "@/components/marketplace-view";
import { JoinPage } from "@/components/join-page";
import { poolsApi, type Pool } from "@/lib/api";
import { HostPlanDetails, type Service } from "@/components/hosted-plans";
import { DashboardSidebar, MobileSectionNav, type DashboardSection } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { PoolCard } from "@/components/dashboard/pool-card";
import { PoolDrawer } from "@/components/dashboard/pool-drawer";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Check, Copy, Layers, Lock, MessageCircle, Search, Send, Sparkles, X } from "lucide-react";

const SECTION_META: Record<DashboardSection, { title: string; meta: string }> = {
  pools: { title: "Your shared pools", meta: "MY SHARED POOLS" },
};

export default function Dashboard() {
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<DashboardSection>("pools");
  const [isSharing, setIsSharing] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [joiningPool, setJoiningPool] = useState<MarketplacePool | null>(null);
  const [myPools, setMyPools] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [selectedPool, setSelectedPool] = useState<Service | null>(null);
  const [isPoolsDrawerOpen, setIsPoolsDrawerOpen] = useState(false);
  const [activeShareService, setActiveShareService] = useState<Service | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Sync dark state from stored / preferred theme on first load
  useEffect(() => {
    const stored = localStorage.getItem("splitza-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initial = (stored ?? preferred) as "dark" | "light";
    setDark(initial === "dark");
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const myRes = await poolsApi.getMyPools();

        // Map backend Pools to frontend Service type
        const mapPool = (p: Pool): Service => {
          const poolName = p.name || p.platformName || "Platform Plan";
          return {
            name: poolName,
            host: p.host || p.hostName || "Host",
            price: p.pricePerSeat,
            capacity: p.maxSeats,
            filled: p.filledSeats || 0,
            private: p.visibility === "PRIVATE",
            brand: poolName.substring(0, 2).toUpperCase(),
            logoUrl: (
              {
                "netflix": "https://cdn.simpleicons.org/netflix/E50914",
                "spotify": "https://cdn.simpleicons.org/spotify/1ED760",
                "youtube": "https://cdn.simpleicons.org/youtube/FF0000",
                "apple": "https://cdn.simpleicons.org/apple/000000",
                "canva": "https://cdn.simpleicons.org/canva/00C4CC",
              } as Record<string, string>
            )[Object.keys({netflix:1,spotify:1,youtube:1,apple:1,canva:1}).find(k => poolName.toLowerCase().includes(k)) || ""],
            accent: p.visibility === "PRIVATE" ? "bg-violet-400" : "bg-emerald-400",
            planMonths: p.planMonths,
          };
        };

        if (myRes.ok) setMyPools(myRes.data.map(mapPool));
      } catch (e) {
        console.error("Failed to load plans from backend", e);
      }
    };
    fetchPools();
  }, []);


  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      const theme = next ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("splitza-theme", theme);
      return next;
    });
  };

  const handleLaunch = async (details: LaunchPlanDetails) => {
    setIsCreating(true);
    try {
      const payload = {
        serviceType: "CUSTOM",
        customName: details.name,
        totalPlanCostINR: details.price * details.limit,
        totalSeats: details.limit + 1, // include host
        planMonths: 1,
        visibility: details.isPrivate ? "PRIVATE" : "PUBLIC",
        hostUpiId: "host@upi", // mock upi since it's not exposed back from SharePage yet
      };

      await poolsApi.create(payload);

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

      setMyPools((prev) => [newService, ...prev]);
      setIsSharing(false);
      setSection("pools");
      if (details.isPrivate) setActiveShareService(newService);
    } catch (e) {
      console.error("Failed to create plan:", e);
      alert("Failed to create plan on backend.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://subsplit.in");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const closePrivatePool = () => setActiveShareService(null);

  if (isSharing) {
    return <SharePage dark={dark} onBack={() => setIsSharing(false)} onLaunch={handleLaunch} />;
  }

  if (isBrowsing && !joiningPool) {
    return (
      <MarketplaceView
        dark={dark}
        onBack={() => setIsBrowsing(false)}
        onCreate={() => { setIsBrowsing(false); setIsSharing(true); }}
        onJoin={(pool) => setJoiningPool(pool)}
      />
    );
  }

  if (joiningPool) {
    return (
      <JoinPage
        pool={joiningPool}
        dark={dark}
        onBack={() => setJoiningPool(null)}
      />
    );
  }

  if (activeService) {
    return (
      <HostPlanDetails
        service={activeService}
        dark={dark}
        onBack={() => setActiveService(null)}
        onShare={(s) => {
          setActiveService(null);
          setIsSharing(true);
        }}
      />
    );
  }

  const filteredPools = myPools.filter((s) =>
    `${s.name} ${s.host}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main
      className={[
        "min-h-screen font-sans transition-colors duration-300",
        dark ? "dark bg-[var(--dash-canvas)] text-[var(--dash-ink)]" : "bg-[var(--dash-canvas)] text-[var(--dash-ink)]",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1320px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardSidebar
          dark={dark}
          active={section}
          onChange={setSection}
          onBrowseMarketplace={() => setIsBrowsing(true)}
          onCreate={() => setIsSharing(true)}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <MobileSectionNav active={section} onChange={setSection} onBrowseMarketplace={() => setIsBrowsing(true)} />

          <DashboardTopbar
            dark={dark}
            onToggleTheme={toggleTheme}
            search={search}
            onSearchChange={setSearch}
            sectionTitle={SECTION_META[section].title}
            sectionMeta={SECTION_META[section].meta}
            onCreate={() => setIsSharing(true)}
          />

          {section === "pools" && (
            <section aria-labelledby="my-plans-title">
              {myPools.length === 0 ? (
                <EmptyState
                  dark={dark}
                  icon={Layers}
                  title="No shared pools yet"
                  description="Host a subscription to split it with others, or browse the marketplace to join an existing pool."
                  actionLabel="Create a split plan"
                  onAction={() => setIsSharing(true)}
                />
              ) : (
                <>
                  <h2 id="my-plans-title" className="sr-only">
                    Your hosted pools
                  </h2>
                  {filteredPools.length === 0 ? (
                    <EmptyState
                      dark={dark}
                      icon={Layers}
                      title="No pools match your search"
                      description="Try a different name or host, or clear the search field."
                    />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {filteredPools.slice(0, 2).map((service, index) => (
                          <PoolCard key={service.name} service={service} dark={dark} index={index} onOpen={setSelectedPool} />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPoolsDrawerOpen(true)}
                        className="mt-4 flex w-full items-center justify-between rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-[var(--dash-surface-strong)]"
                      >
                        <span>
                          <span className="block text-sm font-bold text-[var(--dash-ink)]">View all pools</span>
                          <span className="mt-0.5 block text-xs text-[var(--dash-ink-soft)]">Browse all {filteredPools.length} shared plans</span>
                        </span>
                        <span className="rounded-full bg-[var(--dash-lime)] px-3 py-1.5 text-xs font-black text-[var(--dash-lime-ink)]">{filteredPools.length}</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </section>
          )}

          {/* Quick actions footer */}
          <section className="mt-2 grid gap-4 sm:grid-cols-2">
            <motion.button
              type="button"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsBrowsing(true)}
              className="flex items-center justify-between gap-3 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 text-left"
            >
              <div>
                <p className="text-sm font-bold text-[var(--dash-ink)]">Join a subscription</p>
                <p className="mt-1 text-xs text-[var(--dash-ink-soft)]">
                  Match into a secure shared plan with escrow protection.
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--dash-lime)] text-[var(--dash-lime-ink)]">
                <Sparkles size={16} />
              </span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSharing(true)}
              className="flex items-center justify-between gap-3 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-ink)] p-5 text-left text-[var(--dash-canvas)]"
            >
              <div>
                <p className="text-sm font-bold">Share a subscription</p>
                <p className="mt-1 text-xs text-[var(--dash-canvas)]/70">
                  List your plan safely and route automated UPI payouts.
                </p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--dash-violet)] text-[var(--dash-violet-ink)]">
                <Sparkles size={16} />
              </span>
            </motion.button>
          </section>
        </div>
      </div>

      {isPoolsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="all-pools-title">
          <div className="flex h-full w-full max-w-2xl flex-col border-l border-[var(--dash-border)] bg-[var(--dash-canvas)] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--dash-ink-soft)]">POOL LIBRARY</p>
                <h2 id="all-pools-title" className="mt-1 text-2xl font-black tracking-tight text-[var(--dash-ink)]">All shared pools</h2>
                <p className="mt-1 text-sm text-[var(--dash-ink-soft)]">Browse every plan connected to your account.</p>
              </div>
              <button type="button" aria-label="Close all pools" onClick={() => setIsPoolsDrawerOpen(false)} className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--dash-border)] text-[var(--dash-ink)] transition hover:bg-[var(--dash-surface-strong)]">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2.5">
              <Search size={16} className="text-[var(--dash-ink-soft)]" />
              <input aria-label="Search all pools" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pools or hosts" className="min-w-0 flex-1 bg-transparent text-sm text-[var(--dash-ink)] outline-none placeholder:text-[var(--dash-ink-soft)]" />
            </div>
            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPools.map((service, index) => (
                  <PoolCard key={service.name} service={service} dark={dark} index={index} onOpen={(pool) => { setIsPoolsDrawerOpen(false); setSelectedPool(pool); }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <PoolDrawer
        service={selectedPool}
        dark={dark}
        onClose={() => setSelectedPool(null)}
        onViewFull={(s) => {
          setSelectedPool(null);
          setActiveService(s);
        }}
        onShare={(s) => {
          setSelectedPool(null);
          setIsSharing(true);
        }}
      />

      {/* Private pool popup */}
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
                  <h2 id="private-pool-title" className="mt-2 font-mono text-2xl font-black uppercase leading-tight tracking-[-.06em] sm:text-3xl">Private Split Pool is Live!</h2>
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
              onClick={closePrivatePool}
              className="mt-8 w-full rounded-none border-[3px] border-emerald-300 bg-emerald-300 px-5 py-4 font-mono text-[11px] font-black text-black shadow-[4px_4px_0_#a78bfa] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-white hover:border-white"
            >
              GO TO MY LEDGER
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
