'use client'

import { type ReactNode, useEffect, useId, useRef } from 'react'

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

type LiquidTitleProps = {
  id?: string
  className?: string
  children: ReactNode
  /** Force de la poussée, 0,3 à 1,6. */
  strength?: number
}

/**
 * Le titre liquide (tasteskill, moment `liquid-type`) : là où le pointeur
 * passe, les lettres ondulent comme vues à travers l'eau, puis reviennent
 * nettes en une seconde environ.
 *
 * Un seul filtre SVG (une turbulence qui déplace le texte), posé sur le
 * titre seulement tant qu'une onde vit, retiré ensuite : au repos, c'est
 * du texte ordinaire qui ne coûte rien. Le filtre peint sans jamais
 * recalculer la mise en page. Écran tactile, « réduire les animations » :
 * le titre reste tel qu'écrit.
 */
export default function LiquidTitle({ id, className, children, strength = 1 }: LiquidTitleProps) {
  const filterId = `liquid-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const hostRef = useRef<HTMLDivElement | null>(null)
  const typeRef = useRef<HTMLHeadingElement | null>(null)
  const turbRef = useRef<SVGFETurbulenceElement | null>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    const type = typeRef.current
    const turb = turbRef.current
    const disp = dispRef.current
    if (!host || !type || !turb || !disp) return
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    if (still) return

    const push = clamp(strength, 0.3, 1.6)
    const reach = 0.3
    let energy = 0
    let raf = 0
    let on = false
    let lastX = 0
    let lastY = 0
    let hasLast = false
    let clock = 0
    let px = 0.5

    const apply = () => {
      const scale = Math.min(44, energy) * push
      if (scale < 0.6) {
        if (on) {
          type.style.filter = ''
          on = false
        }
        return false
      }
      disp.setAttribute('scale', scale.toFixed(1))
      // La carte dérive un peu avec la place du pointeur et l'horloge :
      // l'onde coule au lieu de rester figée.
      const dx = 0.006 + (px - 0.5) * 0.002
      const dy = 0.013 + Math.sin(clock / 700) * 0.003
      turb.setAttribute('baseFrequency', `${dx.toFixed(4)} ${dy.toFixed(4)}`)
      if (!on) {
        type.style.filter = `url(#${filterId})`
        on = true
      }
      return true
    }

    const tick = (now: number) => {
      raf = 0
      clock = now
      energy *= 0.93
      if (apply()) raf = requestAnimationFrame(tick)
      else energy = 0
    }

    const move = (e: PointerEvent) => {
      const r = type.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const inside =
        x > -r.width * 0.04 && x < r.width * 1.04 && y > -r.height * 0.2 && y < r.height * 1.2
      if (!inside) {
        hasLast = false
        return
      }
      px = clamp(x / r.width)
      if (hasLast) {
        // Un passage rapide pousse plus fort.
        const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY)
        energy = Math.min(44, energy + Math.min(9, speed * 0.3) * (0.5 + reach))
      }
      lastX = e.clientX
      lastY = e.clientY
      hasLast = true
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const leave = () => {
      hasLast = false
    }

    host.addEventListener('pointermove', move, { passive: true })
    host.addEventListener('pointerleave', leave)
    return () => {
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      if (raf) cancelAnimationFrame(raf)
      type.style.filter = ''
    }
  }, [filterId, strength])

  return (
    <div ref={hostRef} className='liquid-title-host'>
      <svg
        width='0'
        height='0'
        aria-hidden='true'
        style={{ position: 'absolute', pointerEvents: 'none' }}
      >
        <filter
          id={filterId}
          x='-5%'
          y='-20%'
          width='110%'
          height='140%'
          colorInterpolationFilters='sRGB'
        >
          <feTurbulence
            ref={turbRef}
            type='fractalNoise'
            baseFrequency='0.006 0.013'
            numOctaves={1}
            seed={7}
            result='n'
          />
          <feDisplacementMap
            ref={dispRef}
            in='SourceGraphic'
            in2='n'
            scale={0}
            xChannelSelector='R'
            yChannelSelector='G'
          />
        </filter>
      </svg>
      <h2 ref={typeRef} id={id} className={className}>
        {children}
      </h2>
    </div>
  )
}
