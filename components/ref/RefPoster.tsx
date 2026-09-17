'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Ref } from '@/lib/types'
import { posterTheme, thumbnailCandidates } from '@/lib/utils/refPoster'
import { cn } from '@/lib/utils'

type RefPosterProps = {
  ref_data: Ref
  /** Vignette obtenue par oEmbed — voir `useRefThumbnails`. */
  oembedThumbnail?: string | null
  /**
   * Charge l'image sans attendre qu'elle entre dans le viewport. Le feed
   * l'active sur la ref courante et ses voisines : c'est là tout l'intérêt
   * d'être sorti de l'iframe — on peut enfin précharger la suivante.
   */
  priority?: boolean
  className?: string
}

/**
 * L'affiche d'une ref.
 *
 * Deux états, pas un de plus : une image, ou une composition typographique
 * quand il n'y en a pas. Le second n'est pas un placeholder — c'est une
 * affiche à part entière, parce qu'aujourd'hui la colonne `thumbnail` est vide
 * en base et que la moitié des cartes tomberaient dedans.
 */
export function RefPoster({ ref_data, oembedThumbnail, priority, className }: RefPosterProps) {
  const candidates = thumbnailCandidates(ref_data, oembedThumbnail)

  // Rang de l'adresse en cours d'essai. Chaque `error` fait descendre d'un
  // cran (`maxresdefault` → `hqdefault` → affiche de repli).
  const [attempt, setAttempt] = useState(0)

  // La liste s'allonge quand l'oEmbed arrive : il faut alors reprendre les
  // essais au début, sinon la nouvelle adresse ne serait jamais tentée.
  // (Pattern React « ajuster l'état pendant le rendu ».)
  const signature = candidates.join('|')
  const [prevSignature, setPrevSignature] = useState(signature)
  if (signature !== prevSignature) {
    setPrevSignature(signature)
    setAttempt(0)
  }

  const src = candidates[attempt]

  if (!src) {
    const theme = posterTheme(ref_data.slug)

    return (
      <div
        className={cn('relative overflow-hidden', theme.surface, className)}
        role='img'
        aria-label={`${ref_data.titre} — pas d’aperçu disponible`}
      >
        {/* Rayures diagonales : de quoi habiller l'aplat sans lui voler la
            vedette. En pur CSS — pas d'asset à charger pour un repli. */}
        <div
          aria-hidden
          className='absolute inset-0 opacity-[0.07]'
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 14px)',
          }}
        />

        {/* Le « ? » de la marque, en filigrane. */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-6 -bottom-16 select-none font-rader text-[15rem] italic leading-none',
            theme.watermark,
          )}
        >
          ?
        </span>

        {/* Ni titre ni plateforme ici : la carte les porte déjà, à 40px de
            là. Une seule mention, honnête, de ce qui manque — à droite, le
            coin gauche revenant au baromètre. */}
        <span
          className={cn(
            'absolute bottom-4 right-4 font-supplymono text-[10px] uppercase tracking-wider opacity-60',
            theme.ink,
          )}
        >
          Pas d’aperçu
        </span>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-[var(--fg)]', className)}>
      {/*
        Les vignettes n'ont pas toutes le même format — 16/9 côté YouTube,
        9/16 côté TikTok. Un `object-cover` rognerait la moitié des unes ou des
        autres. On garde donc l'image entière (`object-contain`) et on remplit
        le reste du cadre avec elle-même, floutée : la carte garde une
        géométrie constante dans le feed sans jamais couper l'affiche.
      */}
      <Image
        aria-hidden
        src={src}
        alt=''
        fill
        priority={priority}
        sizes='(min-width: 640px) 28rem, 100vw'
        draggable={false}
        className='scale-125 object-cover blur-2xl saturate-150'
      />
      <div aria-hidden className='absolute inset-0 bg-[var(--fg)]/15' />

      <Image
        src={src}
        alt={ref_data.titre}
        fill
        priority={priority}
        sizes='(min-width: 640px) 28rem, 100vw'
        onError={() => setAttempt((rank) => rank + 1)}
        // Un drag qui démarre sur une image déclenche le glisser-déposer natif
        // du navigateur, qui avale le geste : à la souris, le feed refusait de
        // défiler dès qu'on partait de l'affiche. Vérifié au navigateur.
        draggable={false}
        className='object-contain'
      />
    </div>
  )
}
