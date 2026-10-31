"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken } from "@/lib/api"

/**
 * Google OAuth Success Handler
 * Backend redirects here after Google login with:
 *   ?token=<accessToken>&user=<JSON-encoded user>
 * We store the token, update AuthContext, then go to dashboard.
 */
export default function GoogleSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = searchParams.get("token")
    const userRaw = searchParams.get("user")

    if (!token || !userRaw) {
      router.replace("/auth/login?error=google_failed")
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw))

      // Store JWT
      setToken(token)

      // Store user in localStorage (same key as AuthContext)
      localStorage.setItem("splitza_user", JSON.stringify(user))

      // Redirect to dashboard
      router.replace("/dashboard")
    } catch {
      router.replace("/auth/login?error=google_failed")
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="size-12 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
        <p className="text-sm font-semibold text-foreground/60">Signing you in with Google…</p>
      </div>
    </div>
  )
}
