'use client'
import { ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ReactLenis } from 'lenis/react'
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900)
    }

    checkMobile()

    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollSettings = isMobile
    ? {
        duration: 1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: true,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.05,
        wheelMultiplier: 1,
        orientation: 'vertical',
        smoothWheel: true,
        syncTouch: true,
      }
    : {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        orientation: 'vertical',
        smoothWheel: true,
        syncTouch: true,
      }

  /**
   * Le feed est hors de Lenis, pas seulement marqué `data-lenis-prevent`.
   *
   * Lenis est configuré avec `syncTouch` : il écoute `touchmove` sur `window`
   * en `{ passive: false }` et appelle `preventDefault()` pour animer son
   * propre scroll. Le feed, lui, pilote ses gestes verticaux avec Swiper — les
   * deux se disputaient exactement le même geste. `data-lenis-prevent` reste
   * en place, mais il ne couvre que le scroll : ici on retire carrément la
   * couche plutôt que de compter sur elle pour passer son tour.
   *
   * Il n'y a rien à faire défiler sur le feed : il occupe exactement la
   * hauteur du viewport.
   */
  if (pathname?.startsWith('/feed')) return <>{children}</>

  return (
    <ReactLenis root options={scrollSettings}>
      {children}
    </ReactLenis>
  )
}
