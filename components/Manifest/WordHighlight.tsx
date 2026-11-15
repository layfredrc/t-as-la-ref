'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

export type Segment = { text: string; strong?: boolean }

/**
 * Port du moment tasteskill `word-highlight` : la phrase repose à mi-encre
 * et passe à l'encre mot par mot quand elle traverse l'écran, les mots
 * forts à l'accent. Lié au scroll dans les deux sens (elle se rééteint en
 * remontant). Sous mouvement réduit, et sans script, tout est à l'encre.
 *
 * Les mots sont des <span> dans un seul <p> : un lecteur d'écran lit la
 * phrase d'un trait.
 */
export default function WordHighlight({
  segments,
  className,
}: {
  segments: Segment[]
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()
  const words = segments.flatMap((seg) =>
    seg.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, strong: !!seg.strong })),
  )
  // -1 : pas encore monté, tout reste à l'encre (rendu serveur, sans script).
  const [lit, setLit] = useState(-1)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduced) return
      const trigger = ScrollTrigger.create({
        trigger: el,
        // Le premier mot s'allume quand le haut de la phrase passe à 85 %
        // de l'écran, le dernier quand son bas passe à 45 %.
        start: 'top 85%',
        end: 'bottom 45%',
        onUpdate: (self) => setLit(Math.round(self.progress * words.length)),
        onRefresh: (self) => setLit(Math.round(self.progress * words.length)),
      })
      return () => trigger.kill()
    },
    { dependencies: [reduced, words.length] },
  )

  const live = lit >= 0 && !reduced

  return (
    <p ref={ref} className={`word-hl${live ? ' is-live' : ''} ${className ?? ''}`}>
      {words.map(({ word, strong }, i) => (
        <span key={i}>
          <span className={`word-hl-w${strong ? ' is-strong' : ''}${i < lit ? ' is-on' : ''}`}>
            {word}
          </span>{' '}
        </span>
      ))}
    </p>
  )
}
