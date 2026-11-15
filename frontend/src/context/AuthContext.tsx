"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth as authApi, User, setToken, clearToken, getToken } from "@/lib/api";

const USER_STORAGE_KEY = "splitza_user";

function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AuthState = {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  /** null = not checked yet, true = accepted current version, false = needs consent */
  consent: boolean | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "HOST" | "COHOST";
    acceptedTerms: boolean;
    legalVersion: string;
  }) => Promise<{ otpSentTo: string }>;
  verifyOtp: (identifier: string, otp: string) => Promise<User>;
  resendOtp: (identifier: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Set session from external auth (e.g. Google OAuth redirect). */
  setSession: (token: string, user: User) => void;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const consentCheckedFor = useRef<string | null>(null);
  // SSR-safe: always start with null user + loading=true so server and
  // client render the same initial output. Restore from localStorage
  // inside the effect below to avoid hydration mismatches.
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    accessToken: null,
    consent: null,
  });

  // On mount: restore session from localStorage token.
  // Uses a ref to track if setSession was called externally (e.g. Google OAuth)
  // so that restoreSession doesn't overwrite the externally-set state.
  const sessionSetExternally = useRef(false);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        // Don't clobber state if setSession already ran (Google OAuth success page)
        if (!sessionSetExternally.current) {
          setStoredUser(null);
          setState((s) => ({ ...s, user: null, loading: false, consent: null }));
        }
        return;
      }
      try {
        const res = await authApi.me();
        setStoredUser(res.data.user);
        setState({
          user: res.data.user,
          accessToken: token,
          loading: false,
          consent: res.data.consent,
        });
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          // Token invalid or expired — try refresh via cookie
          try {
            const refreshRes = await authApi.refresh();
            setToken(refreshRes.data.accessToken);
            setStoredUser(refreshRes.data.user);
            setState({
              user: refreshRes.data.user,
              accessToken: refreshRes.data.accessToken,
              loading: false,
              consent: null,
            });
          } catch {
            clearToken();
            setStoredUser(null);
            setState({ user: null, accessToken: null, loading: false, consent: null });
          }
        } else {
          // Network error or server down - keep the user logged in locally
          setState((s) => ({ ...s, loading: false }));
        }
      }
    };
    restoreSession();
  }, []);

  // Server-side consent gate (Layer 2): a logged-in user without a consent row
  // for the current legal version is sent to the accept-terms page.
  const userId = state.user?.id;
  useEffect(() => {
    if (state.loading || !userId) return;
    if (pathname.startsWith("/auth") || pathname.startsWith("/legal")) return;
    if (consentCheckedFor.current === userId) return;
    let cancelled = false;
    authApi
      .me()
      .then((res) => {
        if (cancelled) return;
        setState((s) => ({ ...s, consent: res.data.consent }));
        if (res.data.consent === false) {
          router.replace("/auth/accept-terms");
        } else {
          consentCheckedFor.current = userId;
        }
      })
      .catch(() => {
        // Non-fatal: protected API calls will surface consent errors.
      });
    return () => {
      cancelled = true;
    };
  }, [state.loading, userId, pathname, router]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    setToken(res.data.accessToken);
    setStoredUser(res.data.user);
    setState({ user: res.data.user, accessToken: res.data.accessToken, loading: false, consent: null });
    return res.data.user;
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      password: string;
      role: "HOST" | "COHOST";
      acceptedTerms: boolean;
      legalVersion: string;
    }) => {
      const res = await authApi.register(data);
      // Don't set token yet — user still needs to verify OTP
      setState((s) => ({ ...s, user: res.data.user, consent: null }));
      // In development, store the OTP so the verify page can auto-fill it
      if (res.data.devOtp) {
        sessionStorage.setItem("splitza_dev_otp", res.data.devOtp);
      }
      return { otpSentTo: res.data.otpSentTo || data.email };
    },
    []
  );

  const verifyOtp = useCallback(async (identifier: string, otp: string): Promise<User> => {
    const res = await authApi.verifyOtp(identifier, otp);
    setToken(res.data.accessToken);
    setStoredUser(res.data.user);
    setState({ user: res.data.user, accessToken: res.data.accessToken, loading: false, consent: null });
    return res.data.user;
  }, []);

  const resendOtp = useCallback(async (identifier: string): Promise<void> => {
    await authApi.resendOtp(identifier);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    // Fire and forget API call for instant UI response
    authApi.logout().catch(e => {
      console.warn("Logout API failed", e);
    });
    
    clearToken();
    setStoredUser(null);
    consentCheckedFor.current = null;
    setState({ user: null, accessToken: null, loading: false, consent: null });
    router.push("/landing");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setStoredUser(res.data.user);
    setState((s) => ({ ...s, user: res.data.user, consent: res.data.consent }));
  }, []);

  /** Set session from external auth (e.g. Google OAuth redirect). */
  const setSession = useCallback((token: string, user: User) => {
    sessionSetExternally.current = true;
    consentCheckedFor.current = null;
    setToken(token);
    setStoredUser(user);
    setState({ user, accessToken: token, loading: false, consent: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, verifyOtp, resendOtp, logout, refreshUser, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}
