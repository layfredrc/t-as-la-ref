'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, PlusCircle } from 'lucide-react'
import type { AddRefFormData, Ref, Tag, TagsByType } from '@/lib/types'
import { mediaTypeLabels } from '@/lib/utils/detectMediaType'
import { MediaEmbed } from './MediaEmbed'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LikeButton } from './LikeButton'
import { BarometerReadout } from './Barometer'

const scoreCultureLabel: Record<string, string> = {
  inconnu: 'Inconnu 🤷',
  'gen-z': 'Only Gen Z ⚡',
  cultissime: 'Cultissime 🏆',
}

type RefCardProps = {
  ref_data: Ref
  isActive?: boolean
}

export function RefCard({ ref_data, isActive = true }: RefCardProps) {
  const tagTypeRef = ref_data.tags?.find((t: Tag) => t.type === 'type_ref')
  const tagOrigine = ref_data.tags?.find((t: Tag) => t.type === 'origine')
  const tagVibe = ref_data.tags?.find((t: Tag) => t.type === 'vibe')

  return (
    <div className='relative flex justify-center items-center w-full h-full overflow-hidden bg-[var(--bg)]'>
      {/* Ambient blur bg */}
      <div className='absolute inset-0 backdrop-blur-xl bg-[var(--bg2)]/60 pointer-events-none z-0' />

      {/*
        Mobile : dégradé plutôt que carte opaque. Le texte se pose SUR la
        vidéo au lieu de la masquer — même logique que la barre d'actions,
        qui est déjà en blanc + drop-shadow. À partir de `sm`, la carte
        opaque d'origine reprend la main.
      */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent sm:hidden'
      />

      {/*
        `right-[116px]` réserve la largeur réelle de la barre d'actions,
        mesurée à 91px (le libellé « Découvrir » l'élargit au-delà des
        icônes) + 16px de marge + 9px de respiration. Avec `right-20` la
        carte passait dessous, et la barre étant en z-20, elle la recouvrait.
      */}
      <div className='absolute bottom-6 left-4 right-[116px] z-10 flex flex-col gap-3 sm:bottom-auto sm:left-6 sm:right-auto sm:top-6 sm:w-[260px] sm:gap-4 xl:left-12 xl:w-[300px]'>
        <div className='flex flex-col gap-3 sm:gap-4 sm:rounded-lg sm:border-2 sm:border-black sm:bg-[var(--bg2)] sm:p-4'>
          <Link href={`/ref/${ref_data.slug}`}>
            <h1 className='line-clamp-2 font-rader text-2xl uppercase leading-[0.95] text-white drop-shadow-[0_2px_6px_rgba(20,20,20,0.75)] sm:line-clamp-none sm:text-3xl sm:text-[var(--fg)] sm:drop-shadow-none xl:text-4xl'>
              {ref_data.titre}
            </h1>
          </Link>

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

          {/* Une seule ligne défilante sur mobile : trois tags qui passent à
              la ligne, c'est 60px de vidéo masquée en plus. */}
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
            <p className='hidden text-sm text-[var(--fg)]/70 line-clamp-3 sm:block'>
              {ref_data.contexte}
            </p>
          )}

          {/* Sur mobile le CTA ferait 48px de plus : « Découvrir » dans la
              barre d'actions et le titre cliquable mènent au même endroit. */}
          <Link href={`/ref/${ref_data.slug}`} className='hidden sm:block'>
            <Button size='sm' className='rounded-lg w-full'>
              <PlusCircle className='w-4 h-4' />
              Enrichir la ref
            </Button>
          </Link>
        </div>
      </div>

      {/* Centered player — only mounted for the active slide */}
      {isActive && (
        <MediaEmbed url={ref_data.media_url} mediaType={ref_data.media_type} playing={isActive} />
      )}

      {/* Right action panel — barre en verre, icônes pleines façon Instagram */}
      <div className='glass absolute right-4 bottom-8 z-20 flex flex-col gap-6 rounded-2xl p-3 xl:right-12'>
        <LikeButton refId={ref_data.id} initialCount={ref_data.likes_count} variant='overlay' />

        <Link href={`/ref/${ref_data.slug}#comments`} aria-label='Voir le débat'>
          <div className='flex flex-col items-center gap-1'>
            <div className='flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15'>
              <MessageCircle className='h-7 w-7 fill-white text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]' />
            </div>
            <span className='font-supplymono text-xs tabular-nums text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]'>
              {ref_data.comments_count}
            </span>
          </div>
        </Link>

        <Link href={`/ref/${ref_data.slug}`}>
          <div className='flex flex-col items-center gap-1'>
            <div className='flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white/15'>
              <Image
                src='/logo-white.png'
                alt='logo'
                width={36}
                height={36}
                className='rounded-xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]'
                priority
              />
            </div>
            <span className='font-supplymono text-xs text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]'>
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
