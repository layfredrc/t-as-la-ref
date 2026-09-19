'use client'
import { ReactNode } from 'react'
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
 * Lenis ne touche pas au geste tactile : `syncTouch` était actif sur mobile,
 * donc chaque `touchmove` était annulé et rejoué par JavaScript avec un
 * lissage à 0.05 — c'est ce défilement mou, en retard sur le doigt, qui
 * rendait la home « pas ouf » au téléphone. Le défilement natif est ce que le
 * système fait de mieux ; Lenis ne garde que le lissage de la molette, qui
 * n'existe pas sur mobile. Un seul jeu d'options suffit donc.
 */
const OPTIONS: LenisOptions = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: false,
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  /**
   * Le feed est hors de Lenis, pas seulement marqué `data-lenis-prevent`.
   *
   * Le feed pilote ses gestes verticaux avec Swiper ; il n'y a rien à faire
   * défiler, il occupe exactement la hauteur du viewport. On retire carrément
   * la couche plutôt que de compter sur elle pour passer son tour.
   */
  if (pathname?.startsWith('/feed')) return <>{children}</>

  return (
    <ReactLenis root options={OPTIONS}>
      {children}
    </ReactLenis>
  )
}
