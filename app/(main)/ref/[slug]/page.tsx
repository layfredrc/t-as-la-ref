import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { MediaEmbed } from '@/components/ref/MediaEmbed'
import { Badge } from '@/components/ui/badge'
import type { MediaType, Tag } from '@/lib/types'
import { mediaTypeLabels } from '@/lib/utils/detectMediaType'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function RefPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: ref } = await supabase
    .from('refs')
    .select(`
      id, slug, titre, media_url, media_type, contexte, score_culture, likes_count, created_at, auteur_id,
      refs_tags ( tags ( id, label, emoji, type, slug ) )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!ref) notFound()

  const tags: Tag[] = (ref.refs_tags ?? [])
    .flatMap((rt: { tags: unknown }) => {
      const tag = rt.tags as Tag | Tag[] | null
      if (!tag) return []
      return Array.isArray(tag) ? tag : [tag]
    })

  const mediaLabel = mediaTypeLabels[ref.media_type as MediaType]

  return (
    <main className='min-h-screen bg-background px-4 py-12'>
      <div className='max-w-2xl mx-auto flex flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col gap-2'>
          {mediaLabel && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white w-fit ${mediaLabel.color}`}>
              {mediaLabel.emoji} {mediaLabel.label}
            </span>
          )}
          <h1 className='text-3xl font-bold leading-tight'>{ref.titre}</h1>
          {ref.contexte && (
            <p className='text-muted-foreground'>{ref.contexte}</p>
          )}
          <div className='flex flex-wrap gap-1.5'>
            {tags.map((tag) => (
              <Badge key={tag.id} variant='secondary'>
                {tag.emoji} {tag.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Embed */}
        <div className='rounded-2xl overflow-hidden border border-border bg-black/20'>
          <MediaEmbed
            url={ref.media_url}
            mediaType={ref.media_type as MediaType}
          />
        </div>

        {/* Stats */}
        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
          <span>❤️ {ref.likes_count} likes</span>
          <span>•</span>
          <span>{new Date(ref.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span>
        </div>
      </div>
    </main>
  )
}
