import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Product: [
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/#plans", label: "Browse Plans" },
      { href: "/#security", label: "Security" },
      { href: "/pricing", label: "Pricing" },
    ],
    Company: [
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
    Legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/refunds", label: "Refund Policy" },
      { href: "/escrow-policy", label: "Escrow Policy" },
    ],
  };

  return (
    <footer
      className="bg-white border-t border-gray-200 pt-16 pb-8"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr] md:grid-cols-2">

          {/* Brand — full width on tablet */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="navbar-logo-icon">S</div>
              <span className="navbar-logo-text">Splitza</span>
            </div>

            {/* Tagline */}
            <p className="text-[0.9rem] text-gray-500 leading-relaxed max-w-[280px]">
              India&apos;s first automated subscription-sharing marketplace with
              escrow protection and UPI AutoPay.
            </p>

            {/* Badges */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-emerald-500 w-fit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                Escrow Protected
              </div>
              <div className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-emerald-500 w-fit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                UPI AutoPay Compliant
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-4">
              <h3 className="text-sm font-bold tracking-[0.05em] uppercase text-gray-900">
                {category}
              </h3>
              <ul role="list" className="flex flex-col gap-3">
                {items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.9rem] text-gray-500 no-underline transition-colors duration-200 hover:text-emerald-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gray-200" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-gray-500">
            © {year} Splitza Technologies Pvt. Ltd. All rights reserved. · Made with ❤️ in India
          </p>
          <div className="flex gap-2">
            {[
              { label: "Twitter/X", icon: "𝕏", href: "#" },
              { label: "LinkedIn", icon: "in", href: "#" },
              { label: "Instagram", icon: "IG", href: "#" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                id={`footer-${s.label.toLowerCase().replace("/", "-")}`}
                className="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-[0.8125rem] font-bold text-gray-500 no-underline transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 border-t border-gray-200 pt-6 text-xs leading-relaxed text-gray-400">
          Splitza is not affiliated with Netflix, Spotify, YouTube, or any other
          mentioned service. We facilitate cost-sharing between users in
          compliance with applicable Indian laws. Escrow services are provided
          by our licensed payment partner.
        </p>
      </div>
    </footer>
  );
}
