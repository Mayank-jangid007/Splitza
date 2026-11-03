"use client"

import { Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import type { User } from "@/lib/api"

/**
 * Google OAuth Success Handler
 * Backend redirects here after Google login with:
 *   ?token=<accessToken>&user=<JSON-encoded user>
 * We store the token + user via AuthContext.setSession, then go to dashboard.
 */
function GoogleSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSession } = useAuth()
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
      const user = JSON.parse(decodeURIComponent(userRaw)) as User

      // Update AuthContext state (also writes to localStorage internally)
      setSession(token, user)

      // Redirect to dashboard on next tick to ensure state has flushed
      requestAnimationFrame(() => {
        router.replace("/dashboard")
      })
    } catch {
      router.replace("/auth/login?error=google_failed")
    }
  }, [router, searchParams, setSession])

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

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
            <p className="text-sm font-semibold text-foreground/60">Signing you in with Google…</p>
          </div>
        </div>
      }
    >
      <GoogleSuccessContent />
    </Suspense>
  )
}
