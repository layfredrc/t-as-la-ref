'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, X } from 'lucide-react'
import type { Ref } from '@/lib/types'
import { mediaTypeLabels } from '@/lib/utils/detectMediaType'
import { MediaEmbed } from './MediaEmbed'

/** Types que `MediaEmbed` confie à `VideoPlayer`, et qui savent remplir un cadre. */
const FULL_BLEED_TYPES: ReadonlySet<Ref['media_type']> = new Set(['youtube', 'tiktok', 'video'])

type RefPlayerOverlayProps = {
  ref_data: Ref
  onClose: () => void
}

/**
 * La lecture, en plein écran, par-dessus le feed.
 *
 * C'est le pendant de la carte sans lecteur : ici l'embed a toute la surface
 * et **rien ne le recouvre**. Ses propres contrôles (son, scrub, plein écran)
 * sont donc atteignables, et c'est le widget qui gère le son — la seule
 * exception documentée était le feed mobile, où la couche de tap les masquait.
 *
 * On ne swipe pas pendant qu'on regarde : le feed suspend Swiper tant que
 * cette couche est montée. Plus aucun geste à arbitrer, et la fermeture rend
 * le feed exactement là où il était, puisqu'il n'a jamais été démonté.
 */
export function RefPlayerOverlay({ ref_data, onClose }: RefPlayerOverlayProps) {
  const platform = mediaTypeLabels[ref_data.media_type]
  const fullBleed = FULL_BLEED_TYPES.has(ref_data.media_type)

  // Portail vers `body` : Swiper translate son wrapper, et un `position:
  // fixed` posé à l'intérieur d'un ancêtre transformé se cale sur cet ancêtre,
  // pas sur le viewport — la couche défilerait avec les slides.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    // Le feed est en `h-dvh` sans scroll, mais la page sous-jacente peut en
    // avoir un (barre mobile, sidebar) : on le gèle le temps de la lecture.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={`Lecture — ${ref_data.titre}`}
      className='fixed inset-0 z-[80] flex flex-col bg-[var(--fg)]'
    >
      <header className='flex shrink-0 items-center gap-3 px-3 py-3'>
        <button
          type='button'
          onClick={onClose}
          aria-label='Fermer la lecture'
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[var(--bg)] transition-transform hover:scale-105 active:scale-95'
        >
          <X className='h-5 w-5 text-[var(--fg)]' />
        </button>

        <div className='flex min-w-0 flex-col'>
          <span className='font-supplymono text-[10px] uppercase tracking-wider text-[var(--bg)]/60'>
            {platform.emoji} {platform.label}
          </span>
          <span className='truncate font-rader text-base uppercase leading-[0.95] text-[var(--bg)]'>
            {ref_data.titre}
          </span>
        </div>

        <Link
          href={`/ref/${ref_data.slug}`}
          className='ml-auto flex shrink-0 items-center gap-1.5 rounded-full border-2 border-black bg-[var(--accent2)] px-3 py-2 font-supplymono text-[11px] uppercase tracking-wider text-[var(--fg)] transition-transform hover:scale-105'
        >
          La fiche
          <ExternalLink className='h-3.5 w-3.5' />
        </Link>
      </header>

      {/*
        Toute la surface restante pour l'embed. `min-h-0` pour que la zone
        puisse vraiment se réduire au lieu de pousser l'en-tête hors champ.

        `muted={false}` avec `playing` : `VideoPlayer` glisse quand même
        `mute=1` dans l'URL de l'iframe au montage — sans quoi la politique
        d'autoplay refuserait de démarrer — puis rétablit le son via l'API du
        lecteur dès qu'elle répond. La lecture part donc à coup sûr, et avec le
        son. Si le navigateur le refuse malgré tout, les contrôles de la
        plateforme sont juste là.
      */}
      <div className='flex min-h-0 flex-1 items-center justify-center p-2'>
        {fullBleed ? (
          <MediaEmbed
            url={ref_data.media_url}
            mediaType={ref_data.media_type}
            playing
            muted={false}
            className='h-full w-full max-w-none rounded-2xl md:max-w-none lg:max-w-none xl:max-w-none 2xl:max-w-none'
          />
        ) : (
          <div className='max-h-full w-full max-w-lg overflow-y-auto'>
            <MediaEmbed url={ref_data.media_url} mediaType={ref_data.media_type} />
          </div>
        )}
      </div>

      <p className='shrink-0 px-4 pb-4 text-center font-supplymono text-[10px] uppercase tracking-wider text-[var(--bg)]/45'>
        Contrôles {platform.label} · ✕ pour revenir au feed
      </p>
    </div>,
    document.body,
  )
}
