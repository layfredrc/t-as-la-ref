'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'

/** Champs internes de Swiper, absents de ses types publics. */
type SwiperInterne = SwiperType & {
  size?: number
  touchEventsData?: { isTouched?: boolean; isMoved?: boolean; isScrolling?: boolean }
}

/**
 * Panneau de diagnostic du feed, affiché uniquement avec `?debug=1` dans
 * l'URL. Sert à lire sur un vrai téléphone ce qu'aucune émulation ne dit.
 *
 * À retirer une fois le feed stabilisé.
 */
type Facts = {
  build: string
  viewport: string
  smActif: boolean
  embedPointerEvents: string
  coucheDeTap: string
  player: string
  params: string
  son: string
  focusables: string
  verrou: string
}

/** Élément média, avec l'API que le web component YouTube expose. */
type ElementMedia = Element & { muted?: boolean; api?: unknown }

function lire(swiper: SwiperInterne | null): Facts {
  const el = document.querySelector('youtube-video, tiktok-video')
  const iframe = el?.shadowRoot?.querySelector('iframe')
  const src = iframe?.getAttribute('src') ?? ''
  const q = new URLSearchParams(src.split('?')[1] ?? '')
  const tap = document.querySelector('button[aria-label*="vidéo"]')
  const media = el as ElementMedia | null

  return {
    build: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    smActif: window.matchMedia('(min-width: 640px)').matches,
    embedPointerEvents: el?.parentElement
      ? getComputedStyle(el.parentElement).pointerEvents
      : 'pas de player',
    coucheDeTap: tap ? getComputedStyle(tap).display : 'absente',
    player: el?.tagName.toLowerCase() ?? '—',
    params: src
      ? `mute=${q.get('mute') ?? q.get('muted') ?? '∅'} auto=${q.get('autoplay') ?? '∅'} ctrl=${q.get('controls') ?? '∅'}`
      : '—',
    // L'état que le lecteur nous renvoie vraiment — TikTok le met à jour sur
    // les messages `onMute` du player, YouTube via son API. C'est la seule
    // façon de savoir si un `unMute` a été suivi d'effet.
    son: media
      ? `muted=${String(media.muted ?? '∅')} api=${'api' in media ? (media.api ? 'prête' : 'en attente') : 'aucune'}`
      : '—',
    focusables: (swiper?.params.focusableElements ?? '?').includes('button')
      ? 'button INCLUS ⚠️'
      : 'button exclu ✓',
    verrou: swiper
      ? `verrou=${swiper.isLocked ? 'OUI ⚠️' : 'non'} slides=${swiper.slides.length} snap=${swiper.snapGrid.length} size=${Math.round(swiper.size ?? 0)} next=${swiper.allowSlideNext ? 'oui' : 'NON ⚠️'}`
      : 'pas de swiper',
  }
}

export function FeedDebug({ swiper }: { swiper: SwiperInterne | null }) {
  const [actif, setActif] = useState(false)
  const [facts, setFacts] = useState<Facts | null>(null)
  const [journal, setJournal] = useState<string[]>([])

  const ajoute = useCallback((ligne: string) => setJournal((j) => [ligne, ...j].slice(0, 5)), [])

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('debug')) return
    setActif(true)
  }, [])

  useEffect(() => {
    if (!actif) return
    const t = setInterval(() => setFacts(lire(swiper)), 1200)
    return () => clearInterval(t)
  }, [actif, swiper])

  useEffect(() => {
    if (!actif) return

    let depart: { x: number; y: number } | null = null
    let moves = 0
    let idxDepart = 0

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      depart = { x: t.clientX, y: t.clientY }
      moves = 0
      idxDepart = swiper?.activeIndex ?? -1
      // `e.target` est déjà le résultat du hit-testing, mais il ne dit pas si
      // l'iframe a été évité de justesse. `elementFromPoint` le confirme au
      // pixel près, et son `touch-action` calculé dit si le navigateur nous
      // laissera le geste. C'est le contrôle qui aurait attrapé la bande
      // basse de 64px : sous cette ligne, la cible devenait l'embed.
      const sousLeDoigt = document.elementFromPoint(t.clientX, t.clientY)
      const cible = sousLeDoigt ?? (e.target as Element)
      const ta = sousLeDoigt ? getComputedStyle(sousLeDoigt).touchAction : '?'
      ajoute(`↓ ${cible.tagName.toLowerCase()} ${cible.getAttribute('aria-label') ?? ''} ta=${ta}`)
    }
    const onMove = () => {
      moves++
    }
    const fin = (nom: string) => (e: TouchEvent) => {
      if (!depart) return
      const t = e.changedTouches[0]
      const dy = t ? Math.round(t.clientY - depart.y) : 0
      depart = null
      // Capturé tout de suite : Swiper remet ces champs à zéro juste après.
      const d = swiper?.touchEventsData
      const etat = d ? `tou=${d.isTouched} mov=${d.isMoved} scr=${d.isScrolling}` : '—'
      const tr = swiper ? Math.round(swiper.translate) : 0
      setTimeout(() => {
        ajoute(
          `${nom} dy=${dy} mv=${moves} tr=${tr} idx ${idxDepart}→${swiper?.activeIndex ?? -1} ${etat}`,
        )
      }, 450)
    }

    const opts = { capture: true, passive: true } as const
    const onEnd = fin('↑')
    const onCancel = fin('✖ANNULÉ')
    window.addEventListener('touchstart', onStart, opts)
    window.addEventListener('touchmove', onMove, opts)
    window.addEventListener('touchend', onEnd, opts)
    window.addEventListener('touchcancel', onCancel, opts)
    return () => {
      window.removeEventListener('touchstart', onStart, opts)
      window.removeEventListener('touchmove', onMove, opts)
      window.removeEventListener('touchend', onEnd, opts)
      window.removeEventListener('touchcancel', onCancel, opts)
    }
  }, [actif, swiper, ajoute])

  if (!actif) return null

  return (
    <div className='fixed inset-x-0 top-0 z-[999] bg-black/90 p-2 font-mono text-[10px] leading-tight text-green-400'>
      {facts ? (
        <>
          <div>
            build {facts.build} · {facts.viewport} · sm {facts.smActif ? 'ACTIF ⚠️' : 'inactif ✓'}
          </div>
          <div>
            embed pointer-events <b>{facts.embedPointerEvents}</b> · tap {facts.coucheDeTap}
          </div>
          <div>
            {facts.player} · {facts.params}
          </div>
          <div>
            son {facts.son} · {facts.focusables}
          </div>
          <div className='text-cyan-300'>{facts.verrou}</div>
        </>
      ) : (
        <div>lecture…</div>
      )}

      {/*
        Le test qui coupe le problème en deux : si la slide bouge ici mais pas
        au doigt, c'est le geste qui ne passe pas. Si elle ne bouge pas non
        plus, c'est Swiper lui-même qui refuse — mesure ou verrou.
      */}
      <button
        type='button'
        onClick={() => {
          const avant = swiper?.activeIndex ?? -1
          swiper?.slideNext()
          setTimeout(
            () => ajoute(`▶ slideNext() : idx ${avant}→${swiper?.activeIndex ?? -1}`),
            500,
          )
        }}
        className='my-1 rounded border border-green-400 px-2 py-1 text-green-300'
      >
        ▶ tester slideNext()
      </button>

      <div className='border-t border-green-400/30 pt-1 text-yellow-300'>
        {journal.length === 0 ? (
          <div>(fais un swipe)</div>
        ) : (
          journal.map((l, i) => <div key={i}>{l}</div>)
        )}
      </div>
    </div>
  )
}
