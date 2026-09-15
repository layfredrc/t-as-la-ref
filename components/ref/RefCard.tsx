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

      {/* Left info panel */}
      <div className='absolute top-6 left-6 xl:left-12 flex flex-col gap-4 w-[260px] xl:w-[300px] z-10'>
        <div className='border-2 border-black rounded-lg bg-[var(--bg2)] p-4 space-y-4'>
          <h1 className='text-3xl xl:text-4xl font-rader uppercase leading-[0.95] text-[var(--fg)]'>
            {ref_data.titre}
          </h1>

          <div className='flex items-center gap-2'>
            <span className='text-xs font-supplymono text-[var(--fg)]/70'>Score Culture 🔥</span>
            <Badge variant='secondary' className='text-xs'>
              {scoreCultureLabel[ref_data.score_culture] ?? ref_data.score_culture}
            </Badge>
          </div>

          <div className='flex flex-row flex-wrap gap-2'>
            {tagTypeRef && (
              <Badge className='bg-[var(--accent1)] text-[var(--fg)]'>
                {tagTypeRef.emoji} {tagTypeRef.label}
              </Badge>
            )}
            {tagOrigine && (
              <Badge className='bg-[var(--accent5)] text-[var(--fg)]'>
                {tagOrigine.emoji} {tagOrigine.label}
              </Badge>
            )}
            {tagVibe && (
              <Badge className='bg-[var(--accent3)] text-[var(--fg)]'>
                {tagVibe.emoji} {tagVibe.label}
              </Badge>
            )}
          </div>

          {ref_data.contexte && (
            <p className='text-sm text-[var(--fg)]/70 line-clamp-3'>{ref_data.contexte}</p>
          )}

          <Link href={`/ref/${ref_data.slug}`}>
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
