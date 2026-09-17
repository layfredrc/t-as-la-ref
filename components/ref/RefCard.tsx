'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Play,
  PlusCircle,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { AddRefFormData, Ref, Tag, TagsByType } from '@/lib/types'
import { mediaTypeLabels } from '@/lib/utils/detectMediaType'
import { MediaEmbed } from './MediaEmbed'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LikeButton } from './LikeButton'
import { BarometerReadout } from './Barometer'
import { scoreCultureLabel } from '@/lib/utils/scoreCulture'
import { cn } from '@/lib/utils'

type RefCardProps = {
  ref_data: Ref
  isActive?: boolean
  /**
   * Le son est une préférence de session, pas un état de carte : on la
   * remonte au feed pour qu'elle survive au passage à la ref suivante.
   */
  muted?: boolean
  onToggleMuted?: () => void
}

/*
 * Bande basse laissée à l'embed : `bottom-16` (64px), de quoi couvrir la barre
 * de contrôle des lecteurs sans mordre sur la zone où les pouces démarrent un
 * swipe. Les calques qui la surplombent sont en `bottom-20` (80px). En
 * classes et non en style inline : un style inline gagnerait aussi au-dessus
 * de `sm`, où cette bande n'existe pas.
 */

export function RefCard({ ref_data, isActive = true, muted = true, onToggleMuted }: RefCardProps) {
  const tagTypeRef = ref_data.tags?.find((t: Tag) => t.type === 'type_ref')
  const tagOrigine = ref_data.tags?.find((t: Tag) => t.type === 'origine')
  const tagVibe = ref_data.tags?.find((t: Tag) => t.type === 'vibe')

  // Mobile uniquement : le panneau d'infos part replié, à la façon des
  // descriptions TikTok / Reels / Shorts. Sur `sm` et plus il est toujours
  // déployé — la carte latérale ne gêne rien sur grand écran.
  const [expanded, setExpanded] = useState(false)
  const [paused, setPaused] = useState(false)

  // Chaque ref se présente repliée et en lecture : sans ce recalage, l'état
  // de la ref précédente restait collé à la suivante (les slides sont
  // recyclées par Swiper).
  const [prevActive, setPrevActive] = useState(isActive)
  if (isActive !== prevActive) {
    setPrevActive(isActive)
    setExpanded(false)
    setPaused(false)
  }

  const playerRef = useRef<HTMLVideoElement | null>(null)

  // Tap sur la vidéo : referme le panneau s'il est ouvert, sinon play/pause.
  // C'est le « quand on laisse, ça se replie ».
  const handleTap = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Un drag se termine lui aussi par un `click`. Swiper le neutralise
    // (`preventClicks`) dès qu'il a reconnu un swipe : sans ce garde-fou,
    // chaque changement de ref basculerait aussi la lecture.
    if (event.defaultPrevented) return

    // Ne pas laisser le focus sur une cible qui couvre tout l'écran : Swiper
    // refuse de démarrer un drag sur l'élément déjà focus (voir
    // `focusableElements` côté feed). `detail > 0` distingue le tap du clavier,
    // dont on ne veut pas voler le focus.
    if (event.detail > 0) event.currentTarget.blur()

    if (expanded) {
      setExpanded(false)
      return
    }

    const media = playerRef.current
    if (!media) return

    // L'appel part d'ici, dans le handler du geste : c'est ce que le
    // navigateur exige pour autoriser la lecture sur mobile.
    if (media.paused) {
      setPaused(false)
      void media.play().catch(() => setPaused(true))
    } else {
      media.pause()
      setPaused(true)
    }
  }

  return (
    <div className='relative flex justify-center items-center w-full h-full overflow-hidden bg-[var(--bg)]'>
      {/* Ambient blur bg */}
      <div className='absolute inset-0 backdrop-blur-xl bg-[var(--bg2)]/60 pointer-events-none z-0' />

      {/* Centered player — only mounted for the active slide */}
      {isActive && (
        <MediaEmbed
          url={ref_data.media_url}
          mediaType={ref_data.media_type}
          playing={isActive && !paused}
          muted={muted}
          playerRef={playerRef}
        />
      )}

      {/*
        Couche de tap — mobile uniquement.

        L'embed est un iframe cross-origin : un geste qui démarre au-dessus de
        lui reste dans son document, Swiper ne le voit jamais. Cette couche est
        ce qui rend le swipe possible : elle recouvre l'embed, donc le geste
        atterrit sur un élément de notre page et Swiper le traite nativement —
        suivi du doigt, inertie, seuil, et annulation du geste qu'il écoute
        déjà (`touchcancel`, `pointercancel`). Pas de `swiper-no-swiping`, pas
        de recognizer maison : les tentatives qui remesuraient le geste à la
        main passaient en émulation mais pas sur un vrai téléphone.

        Elle s'arrête au-dessus de la bande basse. C'est le compromis assumé :
        là, l'embed reste atteignable, donc ses contrôles (son, scrub, plein
        écran) fonctionnent — et en échange un swipe qui démarre dans ces 64px
        n'aboutit pas, l'iframe l'absorbe. Les pouces démarrent au milieu de
        l'écran, pas au ras du bord.
      */}
      <button
        type='button'
        aria-label={paused ? 'Reprendre la vidéo' : 'Mettre la vidéo en pause'}
        onClick={handleTap}
        className='absolute inset-x-0 bottom-16 top-0 z-[5] sm:hidden'
      />

      {paused && (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 z-[6] flex items-center justify-center sm:hidden'
        >
          <span className='flex h-16 w-16 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm'>
            <Play className='h-8 w-8 fill-white text-white' />
          </span>
        </div>
      )}

      {/*
        Mobile : dégradé plutôt que carte opaque. Le texte se pose SUR la
        vidéo au lieu de la masquer — même logique que la barre d'actions,
        qui est déjà en blanc + drop-shadow. À partir de `sm`, la carte
        opaque d'origine reprend la main. Le dégradé suit l'état : discret
        quand c'est replié, plus soutenu une fois déployé.
      */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-16 z-[7] bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-all duration-300 sm:hidden',
          expanded ? 'h-3/5' : 'h-1/4',
        )}
      />

      {/*
        `right-[76px]` réserve la largeur réelle de la barre d'actions une
        fois rétrécie (52px + 12px de marge + 12px de respiration). Mesuré au
        rendu, pas estimé.
      */}
      <div className='absolute bottom-20 left-4 right-[76px] z-10 flex flex-col gap-3 sm:bottom-auto sm:left-6 sm:right-auto sm:top-6 sm:w-[260px] sm:gap-4 xl:left-12 xl:w-[300px]'>
        <div className='flex flex-col gap-3 sm:gap-4 sm:rounded-lg sm:border-2 sm:border-black sm:bg-[var(--bg2)] sm:p-4'>
          <Link href={`/ref/${ref_data.slug}`}>
            <h1 className='line-clamp-2 font-rader text-2xl uppercase leading-[0.95] text-white drop-shadow-[0_2px_6px_rgba(20,20,20,0.75)] sm:line-clamp-none sm:text-3xl sm:text-[var(--fg)] sm:drop-shadow-none xl:text-4xl'>
              {ref_data.titre}
            </h1>
          </Link>

          {/* État replié : une seule ligne, et l'invite pour déployer. */}
          {!expanded && (
            <button
              type='button'
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              className='flex w-fit items-center gap-2 sm:hidden'
            >
              <BarometerReadout
                drole={ref_data.drole_score}
                importance={ref_data.importance_score}
                variant='mini'
              />
              <span className='font-supplymono text-[11px] text-white/90 drop-shadow-[0_1px_3px_rgba(20,20,20,0.8)]'>
                plus
              </span>
              <ChevronDown className='h-3.5 w-3.5 text-white/90 drop-shadow-[0_1px_3px_rgba(20,20,20,0.8)]' />
            </button>
          )}

          {/*
            Bloc détaillé. L'animation passe par `grid-rows` 0fr → 1fr :
            c'est le seul moyen d'animer vers une hauteur « auto » sans
            figer un max-height au jugé, qui tronque dès que le titre ou le
            contexte dépasse.
          */}
          <div
            className={cn(
              'grid transition-all duration-300 ease-out sm:grid-rows-[1fr] sm:opacity-100',
              expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className='overflow-hidden'>
              <div className='flex flex-col gap-3 sm:gap-4'>
                <BarometerReadout
                  drole={ref_data.drole_score}
                  importance={ref_data.importance_score}
                  variant='compact'
                  votesCount={ref_data.votes_count}
                />

                <div className='flex items-center gap-2'>
                  {/* Le libellé disparaît sur mobile : le badge se suffit. */}
                  <span className='hidden text-xs font-supplymono text-[var(--fg)]/70 sm:inline'>
                    Score Culture 🔥
                  </span>
                  <Badge variant='secondary' className='text-xs'>
                    {scoreCultureLabel(ref_data.score_culture)}
                  </Badge>
                </div>

                {/* Une seule ligne défilante sur mobile : trois tags qui
                    passent à la ligne, c'est 60px de vidéo masquée en plus. */}
                <div className='no-scrollbar flex flex-row gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible'>
                  {tagTypeRef && (
                    <Badge className='shrink-0 bg-[var(--accent1)] text-[var(--fg)]'>
                      {tagTypeRef.emoji} {tagTypeRef.label}
                    </Badge>
                  )}
                  {tagOrigine && (
                    <Badge className='shrink-0 bg-[var(--accent5)] text-[var(--fg)]'>
                      {tagOrigine.emoji} {tagOrigine.label}
                    </Badge>
                  )}
                  {tagVibe && (
                    <Badge className='shrink-0 bg-[var(--accent3)] text-[var(--fg)]'>
                      {tagVibe.emoji} {tagVibe.label}
                    </Badge>
                  )}
                </div>

                {ref_data.contexte && (
                  <p className='line-clamp-3 text-sm text-white/85 drop-shadow-[0_1px_3px_rgba(20,20,20,0.8)] sm:text-[var(--fg)]/70 sm:drop-shadow-none'>
                    {ref_data.contexte}
                  </p>
                )}

                <Link href={`/ref/${ref_data.slug}`}>
                  <Button size='sm' className='rounded-lg w-full'>
                    <PlusCircle className='w-4 h-4' />
                    Enrichir la ref
                  </Button>
                </Link>

                <button
                  type='button'
                  onClick={() => setExpanded(false)}
                  aria-expanded
                  className='flex w-fit items-center gap-1 font-supplymono text-[11px] text-white/90 drop-shadow-[0_1px_3px_rgba(20,20,20,0.8)] sm:hidden'
                >
                  <ChevronUp className='h-3.5 w-3.5' />
                  moins
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right action panel — barre en verre, icônes pleines façon Instagram.
          Resserrée sur mobile : c'est elle qui dictait la largeur perdue par
          la carte, et le libellé « Découvrir » l'élargissait à 91px. */}
      <div className='glass absolute bottom-20 right-3 z-20 flex flex-col gap-4 rounded-2xl p-2 sm:bottom-8 sm:right-4 sm:gap-6 sm:p-3 xl:right-12'>
        {/*
          Le son, seulement sur mobile. Ailleurs, les contrôles du lecteur
          restent atteignables et c'est lui qui gère — ici la couche de tap
          les recouvre, il faut donc une prise.
        */}
        <button
          type='button'
          onClick={onToggleMuted}
          aria-label={muted ? 'Activer le son' : 'Couper le son'}
          aria-pressed={!muted}
          className='flex flex-col items-center gap-1 sm:hidden'
        >
          <div className='flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15'>
            {muted ? (
              <VolumeX className='h-6 w-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]' />
            ) : (
              <Volume2 className='h-6 w-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]' />
            )}
          </div>
        </button>

        <LikeButton refId={ref_data.id} initialCount={ref_data.likes_count} variant='overlay' />

        <Link href={`/ref/${ref_data.slug}#comments`} aria-label='Voir le débat'>
          <div className='flex flex-col items-center gap-1'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15 sm:h-11 sm:w-11'>
              <MessageCircle className='h-6 w-6 fill-white text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:h-7 sm:w-7' />
            </div>
            <span className='font-supplymono text-xs tabular-nums text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]'>
              {ref_data.comments_count}
            </span>
          </div>
        </Link>

        <Link href={`/ref/${ref_data.slug}`} aria-label='Découvrir la ref'>
          <div className='flex flex-col items-center gap-1'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15 sm:h-11 sm:w-11'>
              <Image
                src='/logo-white.png'
                alt=''
                width={36}
                height={36}
                className='h-7 w-7 rounded-xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:h-9 sm:w-9'
                priority
              />
            </div>
            <span className='hidden font-supplymono text-xs text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:inline'>
              Découvrir
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}

type RefCardPreviewProps = {
  formData: AddRefFormData
  tags: TagsByType
}

function findTag(tags: TagsByType, id: string | null): Tag | undefined {
  if (!id) return undefined
  return [...tags.type_ref, ...tags.origine, ...tags.vibe].find((t) => t.id === id)
}

export function RefCardPreview({ formData, tags }: RefCardPreviewProps) {
  const tagTypeRef = findTag(tags, formData.tag_type_ref)
  const tagOrigine = findTag(tags, formData.tag_origine)
  const tagVibe = findTag(tags, formData.tag_vibe)

  const mediaLabel = formData.media_type ? mediaTypeLabels[formData.media_type] : null

  return (
    <div className='w-full max-w-md rounded-2xl border border-border bg-card overflow-hidden shadow-lg'>
      {/* Embed */}
      {formData.media_url && formData.media_type && (
        <div className='bg-black'>
          <MediaEmbed url={formData.media_url} mediaType={formData.media_type} />
        </div>
      )}

      <div className='p-4 flex flex-col gap-3'>
        {/* Platform badge */}
        {mediaLabel && (
          <div className='flex items-center gap-1.5'>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${mediaLabel.color} text-white`}
            >
              {mediaLabel.emoji} {mediaLabel.label}
            </span>
          </div>
        )}

        {/* Titre */}
        <h2 className='text-lg font-bold leading-snug text-foreground'>
          {formData.titre || <span className='text-muted-foreground italic'>Titre de la ref…</span>}
        </h2>

        {/* Contexte */}
        {formData.contexte && (
          <p className='text-sm text-muted-foreground line-clamp-3'>{formData.contexte}</p>
        )}

        <BarometerReadout
          drole={formData.drole_score}
          importance={formData.importance_score}
          variant='compact'
        />

        {/* Tags */}
        <div className='flex flex-wrap gap-1.5'>
          {tagTypeRef && (
            <Badge variant='secondary'>
              {tagTypeRef.emoji} {tagTypeRef.label}
            </Badge>
          )}
          {tagOrigine && (
            <Badge variant='secondary'>
              {tagOrigine.emoji} {tagOrigine.label}
            </Badge>
          )}
          {tagVibe && (
            <Badge variant='secondary'>
              {tagVibe.emoji} {tagVibe.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
