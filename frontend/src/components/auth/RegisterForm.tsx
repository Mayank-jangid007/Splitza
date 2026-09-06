"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function RegisterForm() {
  const router = useRouter();
  const { register, user, accessToken, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!authLoading && user && accessToken) {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, accessToken, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid email is required";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    if (!form.password || form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: "MEMBER", // default role; can be upgraded later
      });
      sessionStorage.setItem("splitza_otp_identifier", form.email);
      router.push("/auth/verify-otp");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Registration form">
      {serverError && <div className="form-error" style={{ marginBottom: "var(--space-4)" }}>{serverError}</div>}

      {/* Form Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-5)" }}>
        <div className="form-group">
          <label htmlFor="reg-name" className="form-label">Full Name <span>*</span></label>
          <div className="input-group">
            <span className="input-icon-left" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Arjun Mehta"
              value={form.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "form-input-error" : ""}`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </div>
          {errors.name && <p id="name-error" className="form-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email Address <span>*</span></label>
          <div className="input-group">
            <span className="input-icon-left" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="arjun@example.com"
              value={form.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? "form-input-error" : ""}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && <p id="email-error" className="form-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-phone" className="form-label">Mobile Number <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
          <div className="input-group" style={{ display: "flex", gap: "var(--space-2)" }}>
            <div style={{
              padding: "0.75rem 1rem",
              background: "var(--color-bg-secondary)",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9375rem",
              color: "var(--color-text-secondary)",
              fontWeight: 600,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}>
              🇮🇳 +91
            </div>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? "form-input-error" : ""}`}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              style={{ flex: 1 }}
            />
          </div>
          {errors.phone && <p id="phone-error" className="form-error">{errors.phone}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">Password <span>*</span></label>
          <div className="input-group">
            <span className="input-icon-left" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "form-input-error" : ""}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
          </div>
          {errors.password && <p id="password-error" className="form-error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm-password" className="form-label">Confirm Password <span>*</span></label>
          <div className="input-group">
            <span className="input-icon-left" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? "form-input-error" : ""}`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
          </div>
          {errors.confirmPassword && <p id="confirm-password-error" className="form-error">{errors.confirmPassword}</p>}
        </div>
      </div>

      {/* Terms */}
      <p className="auth-terms">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="auth-link">Terms of Service</Link> and{" "}
        <Link href="/privacy" className="auth-link">Privacy Policy</Link>.
      </p>

      {/* Submit */}
      <button
        type="submit"
        id="register-submit-btn"
        className={`btn btn-primary btn-lg w-full ${loading ? "btn-loading" : ""}`}
        disabled={loading}
        style={{ marginTop: "var(--space-2)" }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Divider */}
      <div className="divider-text" style={{ margin: "var(--space-5) 0" }}>or continue with</div>

      {/* Google */}
      <button
        type="button"
        id="google-signup-btn"
        className="btn btn-ghost btn-lg w-full"
        style={{ gap: "var(--space-3)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <style>{`
        .auth-terms {
          font-size: 0.8125rem;
          color: var(--color-text-muted);
          line-height: 1.6;
          margin-top: var(--space-4);
        }
        .auth-terms .auth-link { color: var(--color-accent); font-weight: 600; }
      `}</style>
    </form>
  );
}
