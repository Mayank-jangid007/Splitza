import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — Splitza",
  description: "Join Splitza to start saving on your subscriptions or earn by hosting shared plans.",
};

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left hide-mobile">
          <Link href="/" className="auth-logo" aria-label="Splitza home">
            <div className="navbar-logo-icon">S</div>
            <span className="navbar-logo-text">Splitza</span>
          </Link>

          <div className="auth-left-content">
            <h1 className="text-h2">Save on every subscription you love.</h1>
            <p className="text-body-lg text-secondary">
              Join a community that splits smarter — with escrow protection, bot verification, and instant UPI payouts.
            </p>

            <div className="auth-left-stats">
              {[
                { icon: "👥", value: "50K+", label: "Active Members" },
                { icon: "💰", value: "₹2.4Cr", label: "Saved Monthly" },
                { icon: "🛡️", value: "100%", label: "Escrow Protected" },
              ].map((s) => (
                <div key={s.label} className="auth-left-stat">
                  <div className="auth-stat-icon">{s.icon}</div>
                  <div>
                    <div className="auth-stat-value">{s.value}</div>
                    <div className="auth-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="auth-left-footer text-body-sm text-muted">
            Escrow protected · UPI AutoPay compliant · Trusted by 50K+ Indians
          </p>
        </div>

        {/* Right Panel — Form */}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-logo hide-desktop">
              <Link href="/" className="auth-logo">
                <div className="navbar-logo-icon" style={{ width: 32, height: 32, fontSize: "1rem" }}>S</div>
                <span className="navbar-logo-text">Splitza</span>
              </Link>
            </div>

            <h2 className="text-h3 auth-form-title">Create your account</h2>
            <p className="text-body text-secondary auth-form-sub">
              Already have an account?{" "}
              <Link href="/auth/login" className="auth-link">Sign in</Link>
            </p>

            <RegisterForm />
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          background: var(--gradient-hero);
          position: relative;
          overflow: hidden;
        }
        .auth-bg { position: absolute; inset: 0; pointer-events: none; }
        .auth-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.25; }
        .auth-blob-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(108,71,255,0.5), transparent);
          top: -100px; left: -50px;
        }
        .auth-blob-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(0,212,170,0.4), transparent);
          bottom: -50px; right: 30%;
        }
        .auth-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        .auth-left {
          background: var(--gradient-accent);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: var(--space-10);
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 60%);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          z-index: 1;
        }
        .auth-left .navbar-logo-text { color: white; }
        .auth-left-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          z-index: 1;
        }
        .auth-left-content h1 { color: white; }
        .auth-left-content p { color: rgba(255,255,255,0.75); }
        .auth-left-stats { display: flex; flex-direction: column; gap: var(--space-4); }
        .auth-left-stat {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: var(--radius-xl);
          padding: var(--space-4);
        }
        .auth-stat-icon { font-size: 1.5rem; }
        .auth-stat-value { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: white; }
        .auth-stat-label { font-size: 0.8125rem; color: rgba(255,255,255,0.7); }
        .auth-left-footer { color: rgba(255,255,255,0.55); z-index: 1; }
        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
          padding: var(--space-10) var(--space-8);
          overflow-y: auto;
        }
        .auth-form-wrapper {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
        .auth-form-title { color: var(--color-text-primary); }
        .auth-form-sub { color: var(--color-text-secondary); }
        .auth-link {
          color: var(--color-accent);
          font-weight: 600;
          text-decoration: none;
        }
        .auth-link:hover { text-decoration: underline; }
        .hide-desktop { display: none; }
        @media (max-width: 768px) {
          .auth-container { grid-template-columns: 1fr; }
          .hide-desktop { display: flex; }
          .auth-right { padding: var(--space-8) var(--space-5); }
          .auth-form-wrapper { max-width: 100%; }
        }
      `}</style>
    </div>
  );
}
