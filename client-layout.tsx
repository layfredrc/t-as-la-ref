'use client'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ReactLenis } from 'lenis/react'
import type { LenisOptions } from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Réglages Lenis, typés (les anciennes clés `smooth`, `smoothTouch`,
 * `direction`, `gestureDirection` n'existent plus dans Lenis 1.x et étaient
 * ignorées en silence).
 *
 * Sur mobile, Lenis ne touche plus au geste : `syncTouch` était actif, donc
 * chaque `touchmove` était annulé et rejoué par JavaScript avec un lissage à
 * 0.05 — c'est ce défilement mou, en retard sur le doigt, qui rendait la home
 * « pas ouf » au téléphone. Le défilement natif est ce que le système fait de
 * mieux ; Lenis garde le lissage de la molette sur desktop, là où il apporte
 * quelque chose.
 */
const OPTIONS_DESKTOP: LenisOptions = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: false,
}

const OPTIONS_MOBILE: LenisOptions = {
  ...OPTIONS_DESKTOP,
  duration: 1,
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 900px)')
    const sync = () => setIsMobile(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  const scrollSettings = useMemo(() => (isMobile ? OPTIONS_MOBILE : OPTIONS_DESKTOP), [isMobile])

  /**
   * Le feed est hors de Lenis, pas seulement marqué `data-lenis-prevent`.
   *
   * Le feed pilote ses gestes verticaux avec Swiper ; il n'y a rien à faire
   * défiler, il occupe exactement la hauteur du viewport. On retire carrément
   * la couche plutôt que de compter sur elle pour passer son tour.
   */
  if (pathname?.startsWith('/feed')) return <>{children}</>

  return (
    <ReactLenis root options={scrollSettings}>
      {children}
    </ReactLenis>
  )
}
