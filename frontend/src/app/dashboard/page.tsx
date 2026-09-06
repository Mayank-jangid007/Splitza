"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";
import ProfileDropdown from "@/components/profile-dropdown";
import { SharePage, type LaunchPlanDetails } from "@/components/share-page";
import { MarketplaceView, type MarketplacePool } from "@/components/marketplace-view";
import { JoinPage } from "@/components/join-page";
import { poolsApi, type Pool } from "@/lib/api";
import {
  HostPlanDetails,
  ServiceCard,
  defaultServices,
  type Service,
} from "@/components/hosted-plans";
import {
  Bell,
  Check,
  Copy,
  Lock,
  MessageCircle,
  Search,
  Send,
  ArrowUpRight,
} from "lucide-react";


export default function Dashboard() {
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isBrowsing, setIsBrowsing]   = useState(false);
  const [joiningPool, setJoiningPool] = useState<MarketplacePool | null>(null);
  const [myPools, setMyPools] = useState<Service[]>([]);
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [activeShareService, setActiveShareService] = useState<Service | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
    setDark((value) => !value);
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

      const res = await poolsApi.create(payload);

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

  return (
    <main
      className={[
        "min-h-screen overflow-x-hidden px-4 pb-12 font-sans transition-colors duration-300 sm:px-6 lg:px-10",
        dark
          ? "bg-[#020617] text-slate-50"
          : "bg-slate-100 text-slate-950",
      ].join(" ")}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={[
          "sticky top-3 z-50 mx-auto flex h-[64px] w-full max-w-[1220px] items-center gap-3 rounded-lg border-2 px-3 sm:gap-5 sm:px-4",
          "backdrop-blur-xl transition-all duration-300",
          dark
            ? "border-white bg-[#0b1220]/95 shadow-[6px_6px_0_white]"
            : "border-slate-900 bg-white/95 shadow-[6px_6px_0_#a78bfa]",
        ].join(" ")}
      >
        {/* Logo */}

        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <span
            className="
              grid size-9 place-items-center
              rounded-lg border-[3px] border-black
              bg-emerald-300
              font-black text-slate-950
            "
          >
            S
          </span>

          <span className="hidden font-mono text-lg font-black tracking-[-0.08em] sm:block">
            SplitZa
          </span>
        </a>

        {/* Search */}

        <label
          className={[
            "ml-auto hidden min-w-0 flex-1 items-center gap-2 rounded-lg border-[3px] border-black px-3 sm:flex lg:max-w-[520px]",
            "transition-colors duration-200",
            dark
              ? "bg-slate-900 text-slate-400 focus-within:border-white"
              : "bg-slate-50 text-slate-500 focus-within:border-emerald-500",
          ].join(" ")}
        >
          <Search size={16} className="transition-colors" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search apps, active groups, or hosts..."
            className={[
              "min-w-0 flex-1 bg-transparent py-2 font-mono text-[11px] outline-none",
              dark
                ? "text-slate-100 placeholder:text-slate-500"
                : "text-slate-900 placeholder:text-slate-400",
            ].join(" ")}
          />

          <kbd
            className={[
              "rounded border px-1.5 py-1 text-[9px]",
              dark
                ? "border-slate-600 text-slate-400"
                : "border-slate-300 text-slate-500",
            ].join(" ")}
          >
            ⌘K
          </kbd>
        </label>

        {/* Tools */}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          <button
            onClick={() => alert("Messages coming soon!")}
            aria-label="Messages"
            className={[
              "relative grid size-9 place-items-center rounded-lg border-2 transition hover:-translate-y-0.5",
              dark
                ? "border-slate-700 bg-slate-900 hover:border-emerald-300"
                : "border-slate-300 bg-white hover:border-emerald-500",
            ].join(" ")}
          >
            <MessageCircle size={17} />

            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-red-500 font-bold text-[8px] text-white">
              2
            </span>
          </button>

          <button
            onClick={() => alert("Notifications coming soon!")}
            aria-label="Notifications"
            className={[
              "grid size-9 place-items-center rounded-lg border-2 transition hover:-translate-y-0.5",
              dark
                ? "border-slate-700 bg-slate-900 hover:border-emerald-300"
                : "border-slate-300 bg-white hover:border-emerald-500",
            ].join(" ")}
          >
            <Bell size={17} />
          </button>

          {/* Theme button */}

          <AnimatedThemeToggler dark={dark} onToggle={toggleTheme} />

          <ProfileDropdown />
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative mx-auto max-w-[1220px] border-b border-slate-700 px-0 pb-12 pt-16 sm:pt-20 lg:pb-16 lg:pt-24">
        {/* Background decoration */}

        <div
          className="
            pointer-events-none
            absolute right-0 top-8
            hidden size-40 rounded-full
            border border-slate-700
            lg:block
          "
        />

        <div
          className="
            pointer-events-none
            absolute right-10 top-16
            hidden size-24 rounded-full
            border border-dashed border-slate-700
            lg:block
          "
        />

        <div className="relative max-w-4xl">
          <p className="font-mono text-[10px] font-black tracking-[0.18em] text-emerald-300">
            YOUR MEMBER SPACE / 0048
          </p>

          <h1 className="mt-5 font-mono text-[clamp(54px,9vw,118px)] font-black uppercase leading-[0.82] tracking-[-0.1em]">
            Welcome back,
            <br />
            <em className="not-italic text-amber-300">Arjun.</em>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            One place to manage your{" "}
            <span className="inline-block rounded bg-emerald-300 px-1.5 font-bold text-slate-950">
              shared plans
            </span>{" "}
            and save{" "}
            <span className="inline-block rounded bg-amber-300 px-1.5 font-bold text-slate-950">
              ₹1,140 this month
            </span>
            .
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5 font-mono text-[9px] font-bold tracking-[0.12em] text-slate-400">
            <span className="inline-flex items-center gap-2">
              <i className="size-2 rounded-full bg-emerald-300" />
              3 ACTIVE GROUPS
            </span>

            <span>4 VERIFICATIONS PASSED</span>

            <span className="text-amber-300">NEXT AUTOPAY IN 4 DAYS</span>
          </div>
        </div>

        {/* Orbit */}

        <div className="absolute right-[4%] top-14 hidden size-36 rounded-full border border-dashed border-slate-700 lg:block">
          <span
            className="
              absolute left-1/2 top-1/2
              grid size-14 -translate-x-1/2 -translate-y-1/2
              place-items-center
              rounded-full
              border-[3px] border-black
              bg-violet-300
              font-black text-slate-950
              shadow-[5px_5px_0_#34d399]
            "
          >
            A
          </span>

          <span className="absolute -top-4 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-lg border-2 border-black bg-red-500 text-sm font-black text-white shadow-[3px_3px_0_#000]">
            N
          </span>

          <span className="absolute right-[-10px] top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg border-2 border-black bg-green-400 text-sm font-black text-black shadow-[3px_3px_0_#000]">
            S
          </span>

          <span className="absolute -bottom-4 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-lg border-2 border-black bg-red-500 text-xs font-black text-white shadow-[3px_3px_0_#000]">
            ▶
          </span>

          <span className="absolute left-[-10px] top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg border-2 border-black bg-emerald-400 text-sm font-black text-black shadow-[3px_3px_0_#000]">
            C
          </span>
        </div>
      </section>

      {/* =====================================================
          ACTION CARDS
      ===================================================== */}

      <section className="mx-auto grid max-w-[1060px] gap-6 px-0 py-10 lg:grid-cols-2">

        {/* JOINER CARD */}
        <motion.article
          whileHover={{ y: -6, rotate: -0.3 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col justify-between rounded-3xl border-[3px] border-black bg-slate-50 p-7 text-slate-950 shadow-[10px_10px_0_#34d399]"
        >
          <div>
            <span className="font-mono text-xs font-black text-slate-400">01</span>

            <h2 className="mt-5 font-mono text-[clamp(42px,5.5vw,72px)] font-black uppercase leading-[0.85] tracking-[-0.06em]">
              JOIN A<br />
              <span className="text-amber-400">SUBSCRIPTION.</span>
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              Don&apos;t pay full retail. Match into a secure shared plan with built-in escrow protection.
            </p>
          </div>

          <button
            onClick={() => setIsBrowsing(true)}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-transparent px-5 py-4 font-mono text-[11px] font-black text-slate-950 ring-inset ring-emerald-400 transition hover:bg-emerald-300 hover:shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
            style={{ boxShadow: "0 0 0 2px #34d399 inset" }}
          >
            BROWSE ACTIVE GROUPS
            <ArrowUpRight size={15} />
          </button>
        </motion.article>

        {/* HOST CARD */}
        <motion.article
          whileHover={{ y: -6, rotate: 0.3 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col justify-between rounded-3xl border-[3px] border-black bg-[#0b1220] p-7 text-white shadow-[10px_10px_0_#c4b5fd]"
        >
          <div>
            <span className="font-mono text-xs font-black text-slate-500">02</span>

            <h2 className="mt-5 font-mono text-[clamp(42px,5.5vw,72px)] font-black uppercase leading-[0.85] tracking-[-0.06em]">
              SHARE A<br />
              <span className="text-violet-300">SUBSCRIPTION.</span>
            </h2>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              List your active subscription safely and route automated weekly payouts directly to your UPI ID.
            </p>
          </div>

          <button
            onClick={() => setIsSharing(true)}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border-[3px] border-transparent bg-transparent px-5 py-4 font-mono text-[11px] font-black text-white transition hover:bg-violet-300 hover:text-slate-950 hover:shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5"
            style={{ boxShadow: "0 0 0 2px #c4b5fd inset" }}
          >
            CREATE A SPLIT PLAN
            <ArrowUpRight size={15} />
          </button>
        </motion.article>
      </section>


      {/* =====================================================
          MY PLANS GRID
      ===================================================== */}
      {myPools.length > 0 && (
        <section className="mx-auto max-w-[1220px] py-10" aria-labelledby="my-plans-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[9px] font-black tracking-[0.16em] text-violet-300">MY PLANS / {myPools.length.toString().padStart(2, "0")}</p>
              <h2 id="my-plans-title" className={["mt-2 font-mono text-2xl font-black uppercase tracking-[-0.06em] sm:text-3xl", dark ? "text-[#F5F3EC]" : "text-slate-950"].join(" ")}>Your hosted pools</h2>
            </div>
          </div>
          <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {myPools
              .filter((s) => `${s.name} ${s.host}`.toLowerCase().includes(search.toLowerCase()))
              .map((service) => (
                <ServiceCard key={service.name} service={service} dark={dark} onOpen={setActiveService} />
              ))}
          </div>
        </section>
      )}

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
