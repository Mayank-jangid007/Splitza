'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const REVEAL_FROM = { opacity: 0, y: 40 }
const REVEAL_TO = {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: 'power3.out',
  stagger: 0.08,
  clearProps: 'transform',
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  dependencies: unknown[] = [],
) {
  const scope = useRef<T>(null)

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger)

      const root = scope.current
      if (!root) return

      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const targets = gsap.utils.toArray<HTMLElement>('[data-reveal]', root)
        if (targets.length === 0) return

        const firstScreen: HTMLElement[] = []
        const belowFold: HTMLElement[] = []
        const viewportHeight = window.innerHeight

        targets.forEach((element) => {
          if (element.getBoundingClientRect().top < viewportHeight * 0.9) {
            firstScreen.push(element)
          } else {
            belowFold.push(element)
          }
        })

        if (firstScreen.length > 0) {
          gsap.fromTo(firstScreen, REVEAL_FROM, REVEAL_TO)
        }

        if (belowFold.length > 0) {
          gsap.set(belowFold, REVEAL_FROM)
          ScrollTrigger.batch(belowFold, {
            start: 'top 90%',
            once: true,
            onEnter: (batch) => gsap.to(batch, REVEAL_TO),
          })
        }

        ScrollTrigger.refresh()
      })

      return () => media.revert()
    },
    { scope, dependencies, revertOnUpdate: true },
  )

  return scope
}
