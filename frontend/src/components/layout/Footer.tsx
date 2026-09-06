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
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="navbar-logo-icon">S</div>
              <span className="navbar-logo-text">Splitza</span>
            </div>
            <p className="footer-tagline">
              India&apos;s first automated subscription-sharing marketplace with escrow protection and UPI AutoPay.
            </p>
            <div className="footer-badges">
              <div className="footer-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                Escrow Protected
              </div>
              <div className="footer-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                UPI AutoPay Compliant
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category} className="footer-links-col">
              <h3 className="footer-col-title">{category}</h3>
              <ul role="list">
                {items.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider" style={{ margin: "var(--space-8) 0" }} />

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="text-body-sm text-muted">
            © {year} Splitza Technologies Pvt. Ltd. All rights reserved. · Made with ❤️ in India
          </p>
          <div className="footer-socials">
            {[
              { label: "Twitter/X", icon: "𝕏", href: "#" },
              { label: "LinkedIn", icon: "in", href: "#" },
              { label: "Instagram", icon: "IG", href: "#" },
            ].map((s) => (
              <a key={s.label} href={s.href} className="footer-social-btn" aria-label={s.label} id={`footer-${s.label.toLowerCase().replace("/", "-")}`}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="footer-disclaimer">
          Splitza is not affiliated with Netflix, Spotify, YouTube, or any other mentioned service. We facilitate cost-sharing between users in compliance with applicable Indian laws. Escrow services are provided by our licensed payment partner.
        </p>
      </div>

      <style>{`
        .footer {
          background: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding: var(--space-16) 0 var(--space-8);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-10);
        }
        .footer-brand { display: flex; flex-direction: column; gap: var(--space-4); }
        .footer-logo { display: flex; align-items: center; gap: var(--space-3); }
        .footer-tagline { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6; max-width: 280px; }
        .footer-badges { display: flex; flex-direction: column; gap: var(--space-2); }
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-accent);
          width: fit-content;
        }
        .footer-links-col { display: flex; flex-direction: column; gap: var(--space-4); }
        .footer-col-title {
          font-family: var(--font-heading);
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text-primary);
        }
        .footer-links-col ul { display: flex; flex-direction: column; gap: var(--space-3); }
        .footer-link {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          transition: color 0.2s ease;
          text-decoration: none;
        }
        .footer-link:hover { color: var(--color-accent); }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
        }
        .footer-socials { display: flex; gap: var(--space-2); }
        .footer-social-btn {
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .footer-social-btn:hover { background: var(--color-accent); color: white; border-color: var(--color-accent); }
        .footer-disclaimer {
          margin-top: var(--space-6);
          font-size: 0.75rem;
          color: var(--color-text-muted);
          line-height: 1.6;
          border-top: 1px solid var(--color-border);
          padding-top: var(--space-6);
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>
    </footer>
  );
}
