"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COUNTDOWN);
  const canResend = resendCountdown <= 0;
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // In development, auto-fill OTP from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("splitza_dev_otp");
    if (stored && /^\d{6}$/.test(stored)) {
      queueMicrotask(() => {
        setDevOtp(stored);
        setOtp(stored.split(""));
      });
    }
  }, []);

  const handleInput = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length) {
      const newOtp = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((c, i) => { newOtp[i] = c; });
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    }
  }, []);

  const handleVerify = useCallback(async () => {
    const otpValue = otp.join("");
    if (otpValue.length < OTP_LENGTH) { setError("Please enter the complete 6-digit OTP"); return; }
    
    const identifier = sessionStorage.getItem("splitza_otp_identifier");
    if (!identifier) {
      setError("Session expired. Please register or login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await verifyOtp(identifier, otpValue);
      setVerified(true);
      sessionStorage.removeItem("splitza_otp_identifier");
      sessionStorage.removeItem("splitza_dev_otp");
      
      // Redirect based on role
      setTimeout(() => {
        if (user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Invalid OTP. Please try again.");
      }
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [otp, verifyOtp, router]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    const identifier = sessionStorage.getItem("splitza_otp_identifier");
    if (!identifier) {
      setError("Session expired. Please register or login again.");
      return;
    }
    
    setResendCountdown(RESEND_COUNTDOWN);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    inputRefs.current[0]?.focus();
    
    try {
      await resendOtp(identifier);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to resend OTP.");
      }
    }
  }, [canResend, resendOtp]);

  return (
    <div className="otp-page">
      <div className="otp-bg" aria-hidden="true">
        <div className="otp-blob-1" />
        <div className="otp-blob-2" />
      </div>

      <div className="otp-card glass-strong">
        {/* Back link */}
        <Link href="/auth/register" className="otp-back" aria-label="Go back to registration">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </Link>

        {/* Logo */}
        <div className="otp-logo">
          <div className="navbar-logo-icon" style={{ width: 48, height: 48, fontSize: "1.375rem", borderRadius: "14px" }}>S</div>
        </div>

        {verified ? (
          <div className="otp-success animate-scaleIn">
            <div className="otp-success-icon">✓</div>
            <h1 className="text-h3">Verified!</h1>
            <p className="text-body text-secondary">Taking you to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="otp-header">
              <h1 className="text-h3">Verify your number</h1>
              <p className="text-body text-secondary">
                We&apos;ve sent a 6-digit OTP to your email/phone. Enter it below to continue.
              </p>
            </div>

            {/* Dev Mode Banner */}
            {devOtp && (
              <div style={{
                background: "rgba(108,71,255,0.15)",
                border: "1px solid var(--color-accent)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-3) var(--space-4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
              }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>🔧 Dev Mode</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                    Your OTP: <strong style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", letterSpacing: "0.2em" }}>{devOtp}</strong>
                  </div>
                </div>
                <button
                  onClick={() => { const d = devOtp.split(""); setOtp(d); }}
                  style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", textDecoration: "underline" }}
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* OTP Inputs */}
            <div
              className="otp-inputs"
              role="group"
              aria-label="Enter 6-digit OTP"
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  id={`otp-input-${i}`}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`otp-input ${error ? "otp-input-error" : ""} ${digit ? "otp-input-filled" : ""}`}
                  aria-label={`OTP digit ${i + 1} of ${OTP_LENGTH}`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <p className="form-error" style={{ textAlign: "center" }} role="alert">{error}</p>
            )}

            {/* Verify Button */}
            <button
              type="button"
              id="verify-otp-btn"
              className={`btn btn-primary btn-lg w-full ${loading ? "btn-loading" : ""}`}
              onClick={handleVerify}
              disabled={loading || otp.join("").length < OTP_LENGTH}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Resend */}
            <div className="otp-resend">
              <span className="text-body-sm text-muted">Didn&apos;t receive it?</span>
              {canResend ? (
                <button
                  type="button"
                  id="resend-otp-btn"
                  className="otp-resend-btn"
                  onClick={handleResend}
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-body-sm text-muted">
                  Resend in <strong>{resendCountdown}s</strong>
                </span>
              )}
            </div>

            <p className="otp-relay-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Login OTPs are relayed automatically via our secure Pub/Sub system.
            </p>
          </>
        )}
      </div>

      <style>{`
        .otp-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-hero);
          padding: var(--space-6);
          position: relative;
        }
        .otp-bg { position: absolute; inset: 0; pointer-events: none; }
        .otp-blob-1, .otp-blob-2 {
          position: absolute; border-radius: 50%; filter: blur(80px);
        }
        .otp-blob-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(108,71,255,0.35), transparent);
          top: -100px; left: -100px;
        }
        .otp-blob-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(0,212,170,0.3), transparent);
          bottom: -50px; right: -50px;
        }
        .otp-card {
          width: 100%;
          max-width: 440px;
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          position: relative;
          z-index: 1;
          animation: scaleIn 0.3s ease;
        }
        .otp-back {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-decoration: none;
          width: fit-content;
          transition: color 0.2s ease;
        }
        .otp-back:hover { color: var(--color-accent); }
        .otp-logo { display: flex; justify-content: center; }
        .otp-header { display: flex; flex-direction: column; gap: var(--space-2); text-align: center; }
        .otp-inputs {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
        }
        .otp-input {
          width: 52px; height: 60px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-heading);
          background: var(--color-surface);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          color: var(--color-text-primary);
          transition: all 0.2s ease;
          outline: none;
          caret-color: var(--color-accent);
        }
        .otp-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-alpha);
        }
        .otp-input-filled { border-color: var(--color-accent); background: var(--color-accent-light); }
        .otp-input-error { border-color: var(--color-error) !important; }
        .otp-resend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .otp-resend-btn {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-accent);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          transition: opacity 0.2s ease;
        }
        .otp-resend-btn:hover { opacity: 0.75; text-decoration: underline; }
        .otp-relay-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-align: center;
          line-height: 1.5;
        }
        .otp-relay-notice svg { color: var(--color-accent); flex-shrink: 0; }
        .otp-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          text-align: center;
          padding: var(--space-8) 0;
        }
        .otp-success-icon {
          width: 72px; height: 72px;
          background: var(--color-success);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem;
          color: white;
          font-weight: 700;
          box-shadow: 0 8px 32px rgba(0, 196, 113, 0.4);
        }
        @media (max-width: 480px) {
          .otp-input { width: 44px; height: 52px; font-size: 1.25rem; }
          .otp-inputs { gap: var(--space-2); }
        }
      `}</style>
    </div>
  );
}
