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
import { estVideoMedia, mediaTypeLabels } from '@/lib/utils/detectMediaType'
import { MediaEmbed } from './MediaEmbed'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LikeButton } from './LikeButton'
import { BarometerReadout } from './Barometer'
import { commanderSon, type MediaElement } from '@/lib/utils/playerSound'
import { VideoProgress } from './VideoProgress'
import { cn } from '@/lib/utils'

const scoreCultureLabel: Record<string, string> = {
  inconnu: 'Inconnu 🤷',
  'gen-z': 'Only Gen Z ⚡',
  cultissime: 'Cultissime 🏆',
}

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

/**
 * Deux gabarits, parce qu'il y a deux natures d'embed.
 *
 * **Vidéo** (`CarteVideo`) : l'embed est une image, pas une surface de
 * contrôle. Un iframe cross-origin avale tous les gestes qui démarrent au-
 * dessus de lui ; on ne peut donc pas à la fois le recouvrir (pour que Swiper
 * voie le swipe) et le laisser atteignable. Il est recouvert à 100 %, ses
 * contrôles natifs sont coupés, et la carte fournit les siens.
 *
 * **Embed autonome** (`CarteStatique`) : Spotify, SoundCloud, un tweet, une
 * carte. Il n'y a rien à piloter — le lecteur apporte son propre bouton play,
 * et le recouvrir le rendait simplement inutilisable. Il reste donc cliquable,
 * et c'est la mise en page qui lui ménage de quoi swiper autour : cadre
 * contraint, colonne centrée, et pas de chrome vidéo (ni tap plein cadre, ni
 * bouton son, ni barre de progression — ils ne pilotent rien ici).
 */
export function RefCard(props: RefCardProps) {
  if (!estVideoMedia(props.ref_data.media_type)) return <CarteStatique {...props} />
  return <CarteVideo {...props} />
}

// ─── Contenu partagé par les deux gabarits ───────────────────────────────────

type DetailsRefProps = {
  ref_data: Ref
  /**
   * Le texte est-il posé sur la vidéo ? Sur mobile il passe alors en blanc
   * avec une ombre portée. Sur un fond uni il reste à l'encre du design
   * system, qui serait illisible en blanc.
   */
  surImage: boolean
  onReplier: () => void
}

/** Bloc détaillé de la ref — même contenu dans les deux gabarits. */
function DetailsRef({ ref_data, surImage, onReplier }: DetailsRefProps) {
  const tagTypeRef = ref_data.tags?.find((t: Tag) => t.type === 'type_ref')
  const tagOrigine = ref_data.tags?.find((t: Tag) => t.type === 'origine')
  const tagVibe = ref_data.tags?.find((t: Tag) => t.type === 'vibe')

  return (
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
          {scoreCultureLabel[ref_data.score_culture] ?? ref_data.score_culture}
        </Badge>
      </div>

      {/* Une seule ligne défilante sur mobile : trois tags qui passent à la
          ligne, c'est 60px de contenu masqué en plus. */}
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
        <p
          className={cn(
            'line-clamp-3 text-sm',
            surImage
              ? 'text-white/85 drop-shadow-[0_1px_3px_rgba(20,20,20,0.8)] sm:text-[var(--fg)]/70 sm:drop-shadow-none'
              : 'text-[var(--fg)]/70',
          )}
        >
          {ref_data.contexte}
        </p>
      )}

      {/* `asChild` : le lien EST le bouton — un `<button>` dans un `<a>` n'est
          pas du HTML valide. */}
      <Button asChild size='sm' className='rounded-lg w-full'>
        <Link href={`/ref/${ref_data.slug}`}>
          <PlusCircle className='w-4 h-4' />
          Enrichir la ref
        </Link>
      </Button>

      <button
        type='button'
        onClick={onReplier}
        aria-expanded
        className={cn(
          'flex w-fit items-center gap-1 font-supplymono text-[11px] sm:hidden',
          surImage
            ? 'text-white/90 drop-shadow-[0_1px_3px_rgba(20,20,20,0.8)]'
            : 'text-[var(--fg)]/70',
        )}
      >
        <ChevronUp className='h-3.5 w-3.5' />
        moins
      </button>
    </div>
  )
}

type BarreActionsProps = {
  ref_data: Ref
  /**
   * Sur fond uni, le verre dépoli — pensé pour flotter sur une vidéo sombre —
   * donne des icônes blanches sur gris clair. La barre passe alors aux
   * bordures franches du design system.
   */
  solide: boolean
  /** Bouton son : seulement là où il pilote quelque chose, donc en vidéo. */
  boutonSon?: React.ReactNode
}

function BarreActions({ ref_data, solide, boutonSon }: BarreActionsProps) {
  const rond = cn(
    'flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 sm:h-11 sm:w-11',
    solide
      ? 'border-2 border-black bg-[var(--bg2)] hover:bg-[var(--accent2)]'
      : 'hover:bg-white/15',
  )
  const icone = solide
    ? 'h-5 w-5 text-[var(--fg)]'
    : 'h-6 w-6 fill-white text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:h-7 sm:w-7'
  const compteur = cn(
    'font-supplymono text-xs tabular-nums',
    solide ? 'text-[var(--fg)]/70' : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]',
  )

  return (
    <div
      className={cn(
        'absolute bottom-6 right-3 z-20 flex flex-col gap-4 rounded-2xl p-2 sm:bottom-8 sm:right-4 sm:gap-6 sm:p-3 xl:right-12',
        !solide && 'glass',
      )}
    >
      {boutonSon}

      <LikeButton
        refId={ref_data.id}
        initialCount={ref_data.likes_count}
        variant={solide ? 'solid' : 'overlay'}
      />

      <Link href={`/ref/${ref_data.slug}#comments`} aria-label='Voir le débat'>
        <div className='flex flex-col items-center gap-1'>
          <div className={rond}>
            <MessageCircle className={icone} />
          </div>
          <span className={compteur}>{ref_data.comments_count}</span>
        </div>
      </Link>

      <Link href={`/ref/${ref_data.slug}`} aria-label='Découvrir la ref'>
        <div className='flex flex-col items-center gap-1'>
          <div className={rond}>
            <Image
              src={solide ? '/logo.png' : '/logo-white.png'}
              alt=''
              width={36}
              height={36}
              className={cn(
                'rounded-xl',
                solide
                  ? 'h-6 w-6 sm:h-7 sm:w-7'
                  : 'h-7 w-7 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:h-9 sm:w-9',
              )}
              priority
            />
          </div>
          <span className={cn('hidden sm:inline', compteur)}>Découvrir</span>
        </div>
      </Link>
    </div>
  )
}

// ─── Gabarit « embed autonome » : audio, tweet, carte… ───────────────────────

/**
 * Colonne centrée, embed cliquable.
 *
 * Le lecteur garde ses propres commandes : il n'est ni recouvert, ni sorti du
 * hit-testing. Contrepartie assumée — un geste qui démarre sur l'iframe lui
 * appartient, Swiper ne le voit pas. C'est pour ça que l'embed est contraint
 * en largeur et que la colonne garde ses marges : au-dessus, en dessous et
 * dans la gouttière de droite, il reste largement de quoi swiper. Rien à voir
 * avec le cas vidéo, où l'embed occupe tout l'écran et ne laisse aucune prise.
 */
function CarteStatique({ ref_data, isActive = true }: RefCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Chaque ref se présente repliée : les slides sont recyclées par Swiper.
  const [prevActive, setPrevActive] = useState(isActive)
  if (isActive !== prevActive) {
    setPrevActive(isActive)
    setExpanded(false)
  }

  const plateforme = mediaTypeLabels[ref_data.media_type]

  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-hidden bg-[var(--bg2)] py-6 pl-4 pr-[76px] sm:pl-6 sm:pr-24'>
      {/*
        Encadré, comme tous les blocs du design system : sans bordure, la
        colonne flottait au milieu d'un aplat et ne se lisait pas comme une
        carte. C'est le même traitement que le panneau d'infos de la carte
        vidéo à partir de `sm`.
      */}
      <div className='flex w-full max-w-md flex-col gap-3 rounded-2xl border-2 border-black bg-[var(--bg)] p-4 sm:max-w-lg sm:gap-4 sm:p-6'>
        {plateforme && (
          <span
            className={cn(
              'w-fit rounded-full px-2.5 py-1 font-supplymono text-xs text-white',
              plateforme.color,
            )}
          >
            {plateforme.emoji} {plateforme.label}
          </span>
        )}

        <Link href={`/ref/${ref_data.slug}`}>
          <h1 className='line-clamp-3 font-rader text-2xl uppercase leading-[0.95] text-[var(--fg)] sm:text-3xl xl:text-4xl'>
            {ref_data.titre}
          </h1>
        </Link>

        {/*
          Hauteur minimale réservée : l'embed n'est monté que pour la ref
          active — sinon plusieurs lecteurs coexistent et le son d'une ref
          quittée continue. Sans ce plancher, la colonne des slides voisines
          se recomposait pendant le swipe.
        */}
        <div className='min-h-[152px]'>
          {isActive && (
            <MediaEmbed
              url={ref_data.media_url}
              mediaType={ref_data.media_type}
              className='w-full'
            />
          )}
        </div>

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
            <span className='font-supplymono text-[11px] text-[var(--fg)]/70'>plus</span>
            <ChevronDown className='h-3.5 w-3.5 text-[var(--fg)]/70' />
          </button>
        )}

        <div
          className={cn(
            'grid transition-all duration-300 ease-out sm:grid-rows-[1fr] sm:opacity-100',
            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className='overflow-hidden'>
            <DetailsRef ref_data={ref_data} surImage={false} onReplier={() => setExpanded(false)} />
          </div>
        </div>
      </div>

      <BarreActions ref_data={ref_data} solide />
    </div>
  )
}

// ─── Gabarit vidéo ───────────────────────────────────────────────────────────

function CarteVideo({ ref_data, isActive = true, muted = true, onToggleMuted }: RefCardProps) {
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

  const playerRef = useRef<MediaElement | null>(null)

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

  /**
   * Le son, donné au lecteur depuis le clic lui-même.
   *
   * L'ordre part d'ici, et pas seulement de l'effet de `VideoPlayer` : à cet
   * instant l'activation utilisateur est encore valide, ce dont dépend
   * l'autorisation du son par le navigateur. L'état remonte ensuite au feed,
   * qui le garde pour les refs suivantes, et `VideoPlayer` le réaffirme.
   */
  const handleToggleMuted = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail > 0) event.currentTarget.blur()
    commanderSon(playerRef.current, !muted)
    onToggleMuted?.()
  }

  return (
    <div className='relative flex justify-center items-center w-full h-full overflow-hidden bg-[var(--bg2)]'>
      {/*
        Plus de calque `backdrop-blur-xl` plein cadre ici : il floutait un fond
        uni — même rendu, mais une couche de compositing plein écran par slide,
        que le GPU du téléphone payait à chaque swipe.
      */}

      {/* Centered player — only mounted for the active slide */}
      {isActive && (
        <MediaEmbed
          url={ref_data.media_url}
          mediaType={ref_data.media_type}
          playing={isActive && !paused}
          muted={muted}
          // Les contrôles natifs sont coupés à la source : les deux web
          // components traduisent l'absence d'attribut `controls` par
          // `controls=0` dans l'URL de l'iframe. La barre de TikTok, et donc
          // sa redirection vers tiktok.com, n'existe même plus.
          controls={false}
          // Et l'iframe sort du hit-testing : le geste traverse jusqu'à la
          // slide, que la couche de tap ci-dessous soit là ou non.
          className='pointer-events-none'
          playerRef={playerRef}
        />
      )}

      {/*
        Couche de tap — plein cadre, tous les breakpoints.

        Elle recouvre l'embed en entier : le geste atterrit sur un élément de
        notre page et Swiper le traite nativement — suivi du doigt, inertie,
        seuil, et annulation du geste qu'il écoute déjà (`touchcancel`,
        `pointercancel`). Pas de `swiper-no-swiping`, pas de recognizer
        maison : les tentatives qui remesuraient le geste à la main passaient
        en émulation mais pas sur un vrai téléphone.

        Sur desktop aussi, désormais : un drag souris qui démarrait sur
        l'iframe ne faisait rien non plus.
      */}
      <button
        type='button'
        aria-label={paused ? 'Reprendre la vidéo' : 'Mettre la vidéo en pause'}
        onClick={handleTap}
        className='absolute inset-0 z-[5]'
      />

      {paused && (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 z-[6] flex items-center justify-center'
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
          'pointer-events-none absolute inset-x-0 bottom-0 z-[7] bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-all duration-300 sm:hidden',
          expanded ? 'h-3/5' : 'h-1/4',
        )}
      />

      {/*
        `right-[76px]` réserve la largeur réelle de la barre d'actions une
        fois rétrécie (52px + 12px de marge + 12px de respiration). Mesuré au
        rendu, pas estimé.
      */}
      <div className='absolute bottom-6 left-4 right-[76px] z-10 flex flex-col gap-3 sm:bottom-auto sm:left-6 sm:right-auto sm:top-6 sm:w-[260px] sm:gap-4 xl:left-12 xl:w-[300px]'>
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
              <DetailsRef ref_data={ref_data} surImage onReplier={() => setExpanded(false)} />
            </div>
          </div>
        </div>
      </div>

      {/*
        La barre de progression, au ras du bord.

        Elle n'existe que parce que le feed coupe les contrôles natifs du
        lecteur : sans elle, aucun moyen d'avancer dans une vidéo. Le panneau
        d'infos et la barre d'actions sont remontés à `bottom-6` pour lui
        laisser le bord.
      */}
      {isActive && <VideoProgress playerRef={playerRef} active={isActive} />}

      {/* Right action panel — barre en verre, icônes pleines façon Instagram.
          Resserrée sur mobile : c'est elle qui dictait la largeur perdue par
          la carte, et le libellé « Découvrir » l'élargissait à 91px. */}
      <BarreActions
        ref_data={ref_data}
        solide={false}
        boutonSon={
          /*
            Le son, sur tous les breakpoints.

            Il était en `sm:hidden`, ce qui ne laissait sur desktop que les
            contrôles natifs du lecteur — sans effet, puisque `VideoPlayer`
            réaffirme `muted` à chaque rendu et re-coupait aussitôt. Le son y
            était donc structurellement impossible. Maintenant que ce bouton
            est le seul chemin, la réaffirmation ne combat plus personne.
          */
          <button
            type='button'
            onClick={handleToggleMuted}
            aria-label={muted ? 'Activer le son' : 'Couper le son'}
            aria-pressed={!muted}
            className='flex flex-col items-center gap-1'
          >
            <div className='flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15 sm:h-11 sm:w-11'>
              {muted ? (
                <VolumeX className='h-6 w-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:h-7 sm:w-7' />
              ) : (
                <Volume2 className='h-6 w-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:h-7 sm:w-7' />
              )}
            </div>
          </button>
        }
      />
    </div>
  )
}

// ─── Aperçu du flow d'ajout ──────────────────────────────────────────────────

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
