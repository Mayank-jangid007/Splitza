"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>("light");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("splitza-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = stored ?? preferred;
    queueMicrotask(() => {
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("splitza-theme", next);
  }, [theme]);

  const navLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#plans", label: "Browse Plans" },
    { href: "/#security", label: "Security" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link href="/" className="navbar-logo" aria-label="Splitza home">
              <div className="navbar-logo-icon" aria-hidden="true">S</div>
              <span className="navbar-logo-text">Splitza</span>
            </Link>

            {/* Desktop Nav */}
            <ul className="navbar-links hide-mobile" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`navbar-link ${isActive(link.href) ? "navbar-link-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right Controls */}
            <div className="navbar-actions">
              {/* Theme Toggle */}
              <button
                id="theme-toggle-btn"
                className="navbar-theme-btn"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </button>

              <Link href="/auth/login" className="btn btn-ghost btn-sm hide-mobile" id="nav-login-btn">Log in</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm hide-mobile" id="nav-signup-btn">Get Started</Link>

              {/* Mobile hamburger */}
              <button
                id="mobile-menu-btn"
                className="navbar-hamburger"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileOpen}
              >
                <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
                <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
                <span className={`hamburger-line ${mobileOpen ? "open" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? "mobile-menu-open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="container">
          <ul role="list" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Link href="/auth/login" className="btn btn-ghost w-full" id="mobile-login-btn" onClick={() => setMobileOpen(false)}>Log in</Link>
            <Link href="/auth/register" className="btn btn-primary w-full" id="mobile-signup-btn" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
          </div>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: var(--navbar-bg);
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
          padding: 0;
        }
        .navbar-scrolled {
          border-bottom-color: var(--navbar-border);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: var(--shadow-sm);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          gap: var(--space-6);
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          flex-shrink: 0;
        }
        .navbar-logo-icon {
          width: 36px;
          height: 36px;
          background: var(--gradient-accent);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: 1.125rem;
          box-shadow: var(--shadow-accent);
        }
        .navbar-logo-text {
          font-family: var(--font-heading);
          font-size: 1.375rem;
          font-weight: 800;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          list-style: none;
        }
        .navbar-link {
          padding: 0.5rem 0.875rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .navbar-link:hover { color: var(--color-text-primary); background: var(--color-bg-secondary); }
        .navbar-link-active { color: var(--color-accent); background: var(--color-accent-light); }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .navbar-theme-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .navbar-theme-btn:hover { background: var(--color-accent-light); color: var(--color-accent); border-color: var(--color-accent-alpha); }
        .navbar-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
        }
        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--color-text-primary);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .hamburger-line.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger-line.open:nth-child(2) { opacity: 0; }
        .hamburger-line.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mobile-menu {
          position: fixed;
          top: 68px;
          left: 0;
          right: 0;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          z-index: 99;
          padding: var(--space-5) 0;
          transform: translateY(-10px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-lg);
        }
        .mobile-menu-open { transform: translateY(0); opacity: 1; pointer-events: all; }
        .mobile-menu-link {
          display: block;
          padding: var(--space-3) var(--space-4);
          font-size: 1.0625rem;
          font-weight: 500;
          color: var(--color-text-primary);
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .mobile-menu-link:hover { background: var(--color-bg-secondary); color: var(--color-accent); }
        @media (max-width: 768px) {
          .navbar-hamburger { display: flex; }
        }
      `}</style>
    </>
  );
}
