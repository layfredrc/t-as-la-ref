'use client'

import { AlertTriangle } from 'lucide-react'
import type { MediaType } from '@/lib/types'
import { VideoPlayer } from '@/components/VideoPlayer/VideoPlayer'
import { TweetEmbed } from '@/components/TweetEmbed/TweetEmbed'
import { MetaEmbed } from '@/components/MetaEmbed/MetaEmbed'

type MediaEmbedProps = {
  url: string
  mediaType: MediaType
  className?: string
}

export function MediaEmbed({ url, mediaType, className }: MediaEmbedProps) {
  switch (mediaType) {
    case 'youtube':
    case 'tiktok':
    case 'video':
      return <VideoPlayer url={url} className={className} />

    case 'twitter':
      return <TweetEmbed url={url} className={className} />

    case 'instagram':
      return <MetaEmbed url={url} className={className} />

    default:
      return (
        <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
          <p>Type de média non supporté.</p>
        </div>
      )
  }
}
