'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { MediaElement } from '@/lib/utils/playerSound'
import { cn } from '@/lib/utils'

/**
 * Cadence de lecture du temps courant.
 *
 * Les deux lecteurs émettent bien `timeupdate`, mais à des rythmes qui leur
 * appartiennent — YouTube le relaie depuis `onVideoProgress`, TikTok depuis
 * ses messages `onCurrentTime`. On lit nous-mêmes à intervalle fixe : c'est le
 * seul moyen d'avoir la même fluidité partout, et `currentTime` / `duration`
 * sont des getters synchrones sur les deux éléments.
 *
 * 250 ms suffisent : la transition CSS fait le reste du chemin, en linéaire,
 * exactement sur la même durée — la barre avance donc sans à-coups.
 */
const CADENCE_MS = 250

/**
 * Hauteur de la zone qui reçoit le doigt, sous la barre visible.
 *
 * Une barre de 2px ne se vise pas. Ces 20px sont le seul endroit de l'écran
 * où le swipe vertical ne passe pas (classe `swiper-no-swiping`) : c'est
 * assumé et sans commune mesure avec les 64px qui avaient été rendus au
 * lecteur — ici c'est notre contrôle, il est au ras du bord, et il rend le
 * scrub possible.
 */
const ZONE_TACTILE = 'h-5'

type VideoProgressProps = {
  playerRef: RefObject<MediaElement | null>
  /** Le suivi ne tourne que pour la ref affichée. */
  active: boolean
  className?: string
}

/**
 * La barre de progression du feed.
 *
 * Fine et posée au ras du bord — elle ne prend rien à la vidéo. Le violet de
 * la DA (`--accent5`) sert d'encre, avec le halo qui va avec ; la piste reste
 * en blanc très dilué pour ne jamais concurrencer l'image.
 *
 * Elle est nécessaire parce que le feed coupe les contrôles natifs du lecteur
 * (voir `RefCard`) : sans elle, il n'y a aucun moyen d'avancer dans une vidéo.
 */
export function VideoProgress({ playerRef, active, className }: VideoProgressProps) {
  const [duree, setDuree] = useState(0)
  const [temps, setTemps] = useState(0)
  /** Position montrée pendant un scrub, avant de la confirmer au lecteur. */
  const [scrub, setScrub] = useState<number | null>(null)

  const pisteRef = useRef<HTMLDivElement | null>(null)

  // Suivi du temps. Suspendu pendant un scrub : sinon la barre reviendrait
  // sous le doigt à chaque tick.
  useEffect(() => {
    if (!active || scrub !== null) return

    const lire = () => {
      const node = playerRef.current
      if (!node) return
      const d = node.duration
      setDuree(Number.isFinite(d) && d > 0 ? d : 0)
      setTemps(node.currentTime || 0)
    }

    lire()
    const t = setInterval(lire, CADENCE_MS)
    return () => clearInterval(t)
  }, [active, scrub, playerRef])

  // Chaque ref repart de zéro : sans ça, la barre de la précédente reste
  // affichée le temps que le nouveau lecteur réponde.
  useEffect(() => {
    if (active) return
    setTemps(0)
    setDuree(0)
    setScrub(null)
  }, [active])

  const positionDepuisX = useCallback((clientX: number): number => {
    const piste = pisteRef.current
    if (!piste) return 0
    const { left, width } = piste.getBoundingClientRect()
    if (width === 0) return 0
    return Math.min(1, Math.max(0, (clientX - left) / width))
  }, [])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!duree) return
    // Capture du pointeur : le doigt peut sortir de la barre sans que le
    // scrub s'interrompe, et on reçoit le `pointerup` où qu'il se produise.
    event.currentTarget.setPointerCapture(event.pointerId)
    setScrub(positionDepuisX(event.clientX))
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (scrub === null) return
    setScrub(positionDepuisX(event.clientX))
  }

  const terminerScrub = (event: React.PointerEvent<HTMLDivElement>) => {
    if (scrub === null) return
    const cible = scrub * duree
    setScrub(null)
    setTemps(cible)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    // Le seek ne part qu'au relâcher : sur YouTube, un `seekTo` à chaque
    // mouvement rebufferise en continu et la vidéo hoquette.
    const node = playerRef.current
    if (node) node.currentTime = cible
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const node = playerRef.current
    if (!node || !duree) return
    const pas = event.shiftKey ? 30 : 5
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      node.currentTime = Math.min(duree, (node.currentTime || 0) + pas)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      node.currentTime = Math.max(0, (node.currentTime || 0) - pas)
    }
  }

  // Tant que la durée est inconnue (lecteur pas encore prêt, ou média sans
  // durée), on n'affiche rien plutôt qu'une barre morte à zéro.
  if (!active || !duree) return null

  const ratio = scrub ?? Math.min(1, temps / duree)
  const enScrub = scrub !== null

  return (
    <div
      // `swiper-no-swiping` : Swiper ignore les gestes qui démarrent ici. Sans
      // ça, un scrub horizontal part aussi en swipe vertical dès que le doigt
      // dévie — et la ref change au milieu du geste.
      className={cn(
        'swiper-no-swiping absolute inset-x-0 bottom-0 z-[15] flex items-end',
        ZONE_TACTILE,
        className,
      )}
      role='slider'
      tabIndex={0}
      aria-label='Progression de la vidéo'
      aria-valuemin={0}
      aria-valuemax={Math.round(duree)}
      aria-valuenow={Math.round(ratio * duree)}
      aria-valuetext={`${formatTemps(ratio * duree)} sur ${formatTemps(duree)}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={terminerScrub}
      onPointerCancel={terminerScrub}
      onKeyDown={onKeyDown}
      style={{ touchAction: 'none' }}
    >
      {/* Piste. Elle s'épaissit sous le doigt — c'est le seul retour visuel
          qu'on peut donner, l'image de la vidéo n'étant pas à nous. */}
      <div
        ref={pisteRef}
        className={cn(
          'w-full rounded-full bg-white/20 transition-[height] duration-150 ease-out',
          enScrub ? 'h-[5px]' : 'h-[2px]',
        )}
      >
        <div
          className='h-full rounded-full bg-[var(--accent5)]'
          style={{
            width: `${ratio * 100}%`,
            // Le néon signature. En style inline parce qu'il dépend du token
            // de couleur : Tailwind ne compose pas une ombre à partir d'une
            // variable CSS sans la figer dans la config.
            boxShadow: '0 0 6px var(--accent5), 0 0 14px rgba(182, 166, 254, 0.55)',
            // Linéaire et calée sur la cadence de lecture : la barre glisse
            // d'un relevé au suivant au lieu de sauter.
            transition: enScrub ? 'none' : `width ${CADENCE_MS}ms linear`,
          }}
        />
      </div>

      {/* Poignée — seulement pendant le scrub. Au repos, la barre doit
          disparaître dans l'image.

          Calée sur `bottom-0`, sans décalage vers le bas : la barre est au ras
          de l'écran, tout ce qui dépasse est rogné. Elle se pose donc sur la
          ligne plutôt que d'être centrée dessus. */}
      {enScrub && (
        <span
          aria-hidden
          className='pointer-events-none absolute bottom-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--accent5)]'
          style={{
            left: `${ratio * 100}%`,
            boxShadow: '0 0 8px var(--accent5), 0 0 18px rgba(182, 166, 254, 0.6)',
          }}
        />
      )}
    </div>
  )
}

function formatTemps(secondes: number): string {
  const s = Math.max(0, Math.round(secondes))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
