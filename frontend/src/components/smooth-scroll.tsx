'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    gsap.registerPlugin(ScrollTrigger)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let instance: Lenis | null = null
    let ticker: ((time: number) => void) | null = null
    let observer: MutationObserver | null = null
    let paused = false

    const syncPaused = () => {
      if (!instance) return
      const shouldPause = Boolean(document.querySelector('[data-lenis-pause]'))
      if (shouldPause === paused) return
      paused = shouldPause
      if (shouldPause) instance.stop()
      else instance.start()
    }

    const start = () => {
      if (reduceMotion.matches) return

      instance = new Lenis({
        autoRaf: false,
        smoothWheel: true,
        syncTouch: false,
      })
      setLenis(instance)

      instance.on('scroll', ScrollTrigger.update)
      gsap.ticker.lagSmoothing(0)
      ticker = (time) => instance?.raf(time * 1000)
      gsap.ticker.add(ticker)

      observer = new MutationObserver(syncPaused)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-lenis-pause'],
      })

      paused = false
      syncPaused()
      ScrollTrigger.refresh()
    }

    const stop = () => {
      observer?.disconnect()
      observer = null

      if (ticker) {
        gsap.ticker.remove(ticker)
        ticker = null
      }

      instance?.destroy()
      instance = null
      setLenis(null)
    }

    start()

    const onMotionChange = () => {
      stop()
      start()
    }
    reduceMotion.addEventListener('change', onMotionChange)

    return () => {
      reduceMotion.removeEventListener('change', onMotionChange)
      stop()
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
