'use client'

import { useEffect, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'

/**
 * Panneau de diagnostic du feed, affiché uniquement avec `?debug=1` dans
 * l'URL. Sert à lire sur un vrai téléphone ce qu'aucune émulation ne dit :
 * quel build est servi, si le breakpoint `sm` est actif, si l'embed est bien
 * sorti du hit-testing, et ce que le navigateur fait réellement d'un geste.
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
  focusables: string
}

function lire(swiper: SwiperType | null): Facts {
  const el = document.querySelector('youtube-video, tiktok-video')
  const iframe = el?.shadowRoot?.querySelector('iframe')
  const src = iframe?.getAttribute('src') ?? ''
  const q = new URLSearchParams(src.split('?')[1] ?? '')
  const tap = document.querySelector('button[aria-label*="vidéo"]')

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
      ? `mute=${q.get('mute') ?? q.get('muted') ?? '∅'} autoplay=${q.get('autoplay') ?? '∅'} playsinline=${q.get('playsinline') ?? '∅'}`
      : '—',
    focusables: (swiper?.params.focusableElements ?? '?').includes('button')
      ? 'button INCLUS ⚠️'
      : 'button exclu ✓',
  }
}

export function FeedDebug({ swiper }: { swiper: SwiperType | null }) {
  const [actif, setActif] = useState(false)
  const [facts, setFacts] = useState<Facts | null>(null)
  const [journal, setJournal] = useState<string[]>([])

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('debug')) return
    setActif(true)
  }, [])

  useEffect(() => {
    if (!actif) return
    const t = setTimeout(() => setFacts(lire(swiper)), 1500)
    return () => clearTimeout(t)
  }, [actif, swiper])

  useEffect(() => {
    if (!actif) return

    let depart: { x: number; y: number } | null = null
    let moves = 0
    let idxDepart = 0
    const ajoute = (ligne: string) => setJournal((j) => [ligne, ...j].slice(0, 6))

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      depart = { x: t.clientX, y: t.clientY }
      moves = 0
      idxDepart = swiper?.activeIndex ?? -1
      const cible = e.target as Element
      const nom = cible.tagName.toLowerCase()
      const detail =
        cible.getAttribute('aria-label') ?? cible.className?.toString().slice(0, 18) ?? ''
      ajoute(`↓ ${nom} ${detail}`)
    }
    const onMove = () => {
      moves++
    }
    const fin = (nom: string) => (e: TouchEvent) => {
      if (!depart) return
      const t = e.changedTouches[0]
      const dy = t ? Math.round(t.clientY - depart.y) : 0
      const tr = swiper ? Math.round(swiper.translate) : 0
      depart = null
      setTimeout(() => {
        const idx = swiper?.activeIndex ?? -1
        ajoute(`${nom} dy=${dy} moves=${moves} tr=${tr} idx ${idxDepart}→${idx}`)
      }, 450)
    }

    const opts = { capture: true, passive: true } as const
    window.addEventListener('touchstart', onStart, opts)
    window.addEventListener('touchmove', onMove, opts)
    window.addEventListener('touchend', fin('↑'), opts)
    window.addEventListener('touchcancel', fin('✖ ANNULÉ'), opts)
    return () => {
      window.removeEventListener('touchstart', onStart, opts)
      window.removeEventListener('touchmove', onMove, opts)
      window.removeEventListener('touchend', fin('↑'), opts)
      window.removeEventListener('touchcancel', fin('✖ ANNULÉ'), opts)
    }
  }, [actif, swiper])

  if (!actif) return null

  return (
    <div className='pointer-events-none fixed inset-x-0 top-0 z-[999] bg-black/85 p-2 font-mono text-[10px] leading-tight text-green-400'>
      {facts ? (
        <>
          <div>
            build {facts.build} · {facts.viewport} · sm {facts.smActif ? 'ACTIF ⚠️' : 'inactif ✓'}
          </div>
          <div>
            embed pointer-events <b>{facts.embedPointerEvents}</b> · couche de tap{' '}
            {facts.coucheDeTap}
          </div>
          <div>
            {facts.player} · {facts.params}
          </div>
          <div>focusableElements : {facts.focusables}</div>
        </>
      ) : (
        <div>lecture…</div>
      )}
      <div className='mt-1 border-t border-green-400/30 pt-1 text-yellow-300'>
        {journal.length === 0 ? (
          <div>(fais un swipe)</div>
        ) : (
          journal.map((l, i) => <div key={i}>{l}</div>)
        )}
      </div>
    </div>
  )
}
