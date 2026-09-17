'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MobileHeader } from './MobileHeader'

/**
 * Routes qui prennent tout l'écran, sans en-tête.
 *
 * Le feed est un Reels : un bandeau « Explorer » de 64px au-dessus de la vidéo
 * casse l'immersion, et il obligeait le conteneur à se calculer en
 * `calc(100dvh-4rem)` — une mesure de plus à tenir juste pour Swiper. Le menu
 * revient en surimpression dans la page (voir `app/(main)/feed/page.tsx`).
 */
const ROUTES_PLEIN_ECRAN = ['/feed']

function estPleinEcran(pathname: string): boolean {
  return ROUTES_PLEIN_ECRAN.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''

  if (estPleinEcran(pathname)) return <>{children}</>

  return (
    <>
      <MobileHeader />
      {/* Compense la hauteur de l'en-tête, qui est en `fixed`. */}
      <div className='pt-16 md:pt-0'>{children}</div>
    </>
  )
}
