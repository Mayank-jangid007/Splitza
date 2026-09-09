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
      <nav className={`fixed inset-x-0 top-0 z-[100] bg-[var(--navbar-bg)] border-b border-transparent transition-all duration-300 p-0 ${scrolled ? "border-b-[var(--navbar-border)] backdrop-blur-[24px] shadow-[var(--shadow-sm)]" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="flex items-center justify-between h-[68px] gap-[var(--space-6)]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-[var(--space-3)] no-underline shrink-0" aria-label="Splitza home">
              <div className="w-[36px] h-[36px] [background:var(--gradient-accent)] rounded-[10px] flex items-center justify-center text-white font-[var(--font-heading)] font-black text-lg shadow-[var(--shadow-accent)]" aria-hidden="true">S</div>
              <span className="font-[var(--font-heading)] text-[1.375rem] font-extrabold text-[var(--color-text-primary)] tracking-[-0.02em]">Splitza</span>
            </Link>

            {/* Desktop Nav */}
            <ul className="flex items-center gap-[var(--space-1)] list-none hide-mobile" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-[0.875rem] py-[0.5rem] text-[0.9375rem] font-medium text-[var(--color-text-secondary)] rounded-[var(--radius-md)] transition-all duration-200 no-underline hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] ${isActive(link.href) ? "text-[var(--color-accent)] bg-[var(--color-accent-light)]" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right Controls */}
            <div className="flex items-center gap-[var(--space-3)]">
              {/* Theme Toggle */}
              <button
                id="theme-toggle-btn"
                className="w-[38px] h-[38px] rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center cursor-pointer text-[var(--color-text-secondary)] transition-all duration-200 shrink-0 hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent-alpha)]"
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
                className="flex md:hidden flex-col gap-[5px] p-[8px] bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileOpen}
              >
                <span className={`block w-[20px] h-[2px] bg-[var(--color-text-primary)] rounded-[2px] transition-all duration-300 origin-center ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block w-[20px] h-[2px] bg-[var(--color-text-primary)] rounded-[2px] transition-all duration-300 origin-center ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-[20px] h-[2px] bg-[var(--color-text-primary)] rounded-[2px] transition-all duration-300 origin-center ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed top-[68px] inset-x-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] z-[99] py-[var(--space-5)] transition-all duration-300 shadow-[var(--shadow-lg)] ${mobileOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-[10px] opacity-0 pointer-events-none"}`} aria-hidden={!mobileOpen}>
        <div className="container">
          <ul role="list" className="flex flex-col gap-[var(--space-2)]">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block py-[var(--space-3)] px-[var(--space-4)] text-[1.0625rem] font-medium text-[var(--color-text-primary)] rounded-[var(--radius-md)] transition-all duration-200 no-underline hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-accent)]" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
            <Link href="/auth/login" className="btn btn-ghost w-full" id="mobile-login-btn" onClick={() => setMobileOpen(false)}>Log in</Link>
            <Link href="/auth/register" className="btn btn-primary w-full" id="mobile-signup-btn" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
          </div>
        </div>
      </div>

    </>
  );
}
