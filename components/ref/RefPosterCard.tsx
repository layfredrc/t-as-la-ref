'use client'

import Link from 'next/link'
import { MessageCircle, Play, PlusCircle } from 'lucide-react'
import type { Ref, Tag } from '@/lib/types'
import { mediaTypeLabels } from '@/lib/utils/detectMediaType'
import { scoreCultureLabel } from '@/lib/utils/scoreCulture'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarometerReadout } from './Barometer'
import { LikeButton } from './LikeButton'
import { RefPoster } from './RefPoster'

type RefPosterCardProps = {
  ref_data: Ref
  /** Vignette obtenue par oEmbed — voir `useRefThumbnails`. */
  oembedThumbnail?: string | null
  /** Charge l'affiche tout de suite : ref courante et voisines immédiates. */
  priority?: boolean
  onOpenPlayer: () => void
}

/**
 * La carte du feed poster-first.
 *
 * Elle n'embarque aucun lecteur : affiche, titre, tags, baromètre, score
 * culture et actions, tout est à nous. La vidéo n'arrive qu'au tap, en plein
 * écran (voir `RefPlayerOverlay`) — ce qui rend le swipe trivial, permet de
 * précharger l'affiche suivante, et donne enfin au feed une identité visuelle
 * qui ne dépend plus de la plateforme d'origine.
 *
 * Le parti pris : une carte de bibliothèque, pas un plein-cadre à la TikTok.
 * Le produit est un catalogue — la fiche doit se lire comme une fiche.
 */
export function RefPosterCard({
  ref_data,
  oembedThumbnail,
  priority,
  onOpenPlayer,
}: RefPosterCardProps) {
  const tagTypeRef = ref_data.tags?.find((t: Tag) => t.type === 'type_ref')
  const tagOrigine = ref_data.tags?.find((t: Tag) => t.type === 'origine')
  const tagVibe = ref_data.tags?.find((t: Tag) => t.type === 'vibe')
  const platform = mediaTypeLabels[ref_data.media_type]

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Un swipe se termine lui aussi par un `click`. Swiper le neutralise
    // (`preventClicks`) dès qu'il a reconnu un geste : sans ce garde-fou,
    // chaque changement de ref ouvrirait le lecteur.
    if (event.defaultPrevented) return

    // Ne pas laisser le focus sur la cible : Swiper refuse de démarrer un drag
    // sur l'élément déjà focus s'il est dans `focusableElements` (voir le
    // commentaire côté feed). `detail > 0` distingue le tap du clavier, dont
    // on ne veut surtout pas voler le focus.
    if (event.detail > 0) event.currentTarget.blur()

    onOpenPlayer()
  }

  // `pt-14` : la barre de position du feed occupe le haut de l'écran (voir la
  // page). Elle est en surimpression pour ne pas réduire la hauteur de Swiper,
  // qui mesure mal dès qu'on lui change sa boîte — c'est donc à la carte de
  // lui laisser la place.
  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-hidden bg-[var(--bg)] px-5 pb-5 pt-14 sm:pb-8 sm:pt-16'>
      {/* Halo d'ambiance — deux taches diffuses, pour que le fond ne soit pas
          un aplat mort derrière la carte. */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-70'
        style={{
          backgroundImage:
            'radial-gradient(60% 40% at 15% 10%, var(--accent2) 0%, transparent 60%), radial-gradient(55% 45% at 90% 85%, var(--accent3) 0%, transparent 65%)',
        }}
      />

      {/*
        Le plafond de hauteur sur grand écran n'est pas cosmétique : sans lui
        la carte s'étire sur toute la colonne et le cadre de l'affiche devient
        très portrait, alors que les vignettes YouTube sont en 16/9 — on
        obtenait deux énormes bandes floues. Plus large et moins haute, la
        carte cadre l'affiche de près.
      */}
      <article className='shadow-badge relative z-10 flex h-full w-full max-w-[26rem] flex-col overflow-hidden rounded-2xl border-2 border-black bg-[var(--bg2)] sm:max-h-[40rem] sm:max-w-[34rem]'>
        {/*
          L'affiche, et la seule cible de tap de la carte.

          `min-h-0` sur un enfant `flex-1` : sans lui, la boîte refuse de
          descendre sous la hauteur de son contenu et la carte déborde de
          l'écran sur les petits téléphones. Avec, l'affiche prend simplement
          ce qui reste une fois le pied de carte servi.
        */}
        <button
          type='button'
          onClick={handleOpen}
          aria-label={`Lire « ${ref_data.titre} »`}
          className='group relative min-h-0 flex-1 overflow-hidden text-left'
        >
          <RefPoster
            ref_data={ref_data}
            oembedThumbnail={oembedThumbnail}
            priority={priority}
            className='absolute inset-0'
          />

          <span className='absolute left-3 top-3 rounded-full border-2 border-black bg-[var(--bg)] px-2.5 py-1 font-supplymono text-[10px] uppercase tracking-wider text-[var(--fg)]'>
            {platform.emoji} {platform.label}
          </span>

          {/* Le score culture en vignette d'angle, façon pastille de jaquette :
              il gagne à être vu d'un coup d'œil, et il libère une ligne dans le
              pied de carte, où la place se compte. */}
          <span className='absolute right-3 top-3 -rotate-6 rounded-full border-2 border-black bg-[var(--accent2)] px-2.5 py-1 font-supplymono text-[10px] uppercase tracking-wider text-[var(--fg)] shadow-[2px_2px_0_rgba(0,0,0,0.9)]'>
            {scoreCultureLabel(ref_data.score_culture)}
          </span>

          {/*
            Le baromètre sur l'affiche plutôt que dans le pied de carte.

            Mesuré au navigateur : avec la jauge complète en pied, le bloc de
            texte occupait 320px sur les 430 d'un iPhone SE et il ne restait
            que 77px d'affiche — un feed poster-first où l'affiche est la plus
            petite chose de l'écran. En surimpression, la note se lit d'un coup
            d'œil et l'image reprend toute la place. La jauge détaillée reste
            sur la fiche de la ref.
          */}
          <span className='absolute bottom-3 left-3'>
            <BarometerReadout
              drole={ref_data.drole_score}
              importance={ref_data.importance_score}
              variant='mini'
            />
          </span>

          {/* Le geste à faire, dit une fois, au centre. */}
          <span className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2'>
            <span className='flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[var(--accent1)] shadow-[0_6px_0_rgba(0,0,0,0.9)] transition-transform duration-200 group-hover:scale-110 group-active:translate-y-1 group-active:shadow-[0_2px_0_rgba(0,0,0,0.9)]'>
              <Play className='ml-1 h-7 w-7 fill-[var(--bg)] text-[var(--bg)]' />
            </span>
            <span className='rounded-full bg-black/55 px-2.5 py-1 font-supplymono text-[10px] uppercase tracking-wider text-white backdrop-blur-sm'>
              Tape pour lire
            </span>
          </span>
        </button>

        {/* Pied de carte — la fiche proprement dite. `shrink-0` : c'est
            l'affiche qui absorbe les variations de hauteur, pas le texte. */}
        <div className='flex shrink-0 flex-col gap-2.5 border-t-2 border-black bg-[var(--bg2)] p-4'>
          <Link href={`/ref/${ref_data.slug}`} className='block'>
            <h2 className='line-clamp-2 font-rader text-2xl uppercase leading-[0.95] text-[var(--fg)] sm:text-3xl'>
              {ref_data.titre}
            </h2>
          </Link>

          {/* Les trois axes de la taxonomie, en entier. Une rangée défilante
              coupait le troisième tag au milieu d'un mot — sur un catalogue,
              c'est précisément l'information qu'on vient chercher. */}
          <div className='flex flex-wrap gap-1.5'>
            {tagTypeRef && (
              <Badge className='bg-[var(--accent1)] text-[11px] text-[var(--fg)]'>
                {tagTypeRef.emoji} {tagTypeRef.label}
              </Badge>
            )}
            {tagOrigine && (
              <Badge className='bg-[var(--accent5)] text-[11px] text-[var(--fg)]'>
                {tagOrigine.emoji} {tagOrigine.label}
              </Badge>
            )}
            {tagVibe && (
              <Badge className='bg-[var(--accent3)] text-[11px] text-[var(--fg)]'>
                {tagVibe.emoji} {tagVibe.label}
              </Badge>
            )}
          </div>

          {/* Barre d'actions — dans la carte, pas en rail flottant : rien ne
              recouvre plus la vidéo, il n'y a plus de raison de la sortir. */}
          <div className='flex items-center gap-4'>
            <LikeButton refId={ref_data.id} initialCount={ref_data.likes_count} variant='solid' />

            <Link
              href={`/ref/${ref_data.slug}#comments`}
              aria-label='Voir le débat'
              className='flex flex-col items-center gap-1'
            >
              <span className='flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[var(--bg2)] transition-all hover:scale-110 hover:bg-[var(--accent2)]'>
                <MessageCircle className='h-5 w-5 text-[var(--fg)]' />
              </span>
              <span className='font-supplymono text-xs tabular-nums text-[var(--fg)]/70'>
                {ref_data.comments_count}
              </span>
            </Link>

            <Link href={`/ref/${ref_data.slug}`} className='ml-auto'>
              <Button size='sm' className='rounded-lg'>
                <PlusCircle className='h-4 w-4' />
                Enrichir
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
