"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { auth as authApi, User, setToken, clearToken, getToken } from "@/lib/api";

const USER_STORAGE_KEY = "splitza_user";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(USER_STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

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
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "HOST" | "COHOST";
  }) => Promise<{ otpSentTo: string }>;
  verifyOtp: (identifier: string, otp: string) => Promise<User>;
  resendOtp: (identifier: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
  const [state, setState] = useState<AuthState>(() => ({
    user: getStoredUser(),
    loading: true,
    accessToken: typeof window !== "undefined" ? getToken() : null,
  }));

  // On mount: restore session from localStorage token
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setStoredUser(null);
        setState((s) => ({ ...s, user: null, loading: false }));
        return;
      }
      try {
        const res = await authApi.me();
        setStoredUser(res.data.user);
        setState({ user: res.data.user, accessToken: token, loading: false });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          // Token invalid or expired — try refresh via cookie
          try {
            const refreshRes = await authApi.refresh();
            setToken(refreshRes.data.accessToken);
            setStoredUser(refreshRes.data.user);
            setState({ user: refreshRes.data.user, accessToken: refreshRes.data.accessToken, loading: false });
          } catch {
            clearToken();
            setStoredUser(null);
            setState({ user: null, accessToken: null, loading: false });
          }
        } else {
          // Network error or server down - keep the user logged in locally
          setState((s) => ({ ...s, loading: false }));
        }
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    setToken(res.data.accessToken);
    setStoredUser(res.data.user);
    setState({ user: res.data.user, accessToken: res.data.accessToken, loading: false });
    return res.data.user;
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; phone?: string; password: string; role: "HOST" | "COHOST" }) => {
      const res = await authApi.register(data);
      // Don't set token yet — user still needs to verify OTP
      setState((s) => ({ ...s, user: res.data.user }));
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
    setState({ user: res.data.user, accessToken: res.data.accessToken, loading: false });
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
    setState({ user: null, accessToken: null, loading: false });
    router.push("/landing");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setStoredUser(res.data.user);
    setState((s) => ({ ...s, user: res.data.user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, verifyOtp, resendOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
