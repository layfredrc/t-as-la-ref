'use client'

import { AlertTriangle, MapPin, ExternalLink } from 'lucide-react'
import type { MediaType } from '@/lib/types'
import { VideoPlayer } from '@/components/VideoPlayer/VideoPlayer'
import { TweetEmbed } from '@/components/TweetEmbed/TweetEmbed'
import { MetaEmbed } from '@/components/MetaEmbed/MetaEmbed'

// ─── URL transformers ─────────────────────────────────────────────────────────

function spotifyEmbedUrl(url: string): string {
  // https://open.spotify.com/intl-fr/track/ID → https://open.spotify.com/embed/track/ID
  const match = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist|episode|show)\/([^?]+)/)
  if (match) return `https://open.spotify.com/embed/${match[1]}/${match[2]}`
  return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
}

function soundcloudEmbedUrl(url: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&visual=true`
}

function facebookEmbedUrl(url: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`
}

// ─── Sub-embeds ───────────────────────────────────────────────────────────────

function SpotifyEmbed({ url }: { url: string }) {
  return (
    <iframe
      src={spotifyEmbedUrl(url)}
      width="100%"
      height="152"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl"
      style={{ border: 'none' }}
    />
  )
}

function SoundCloudEmbed({ url }: { url: string }) {
  return (
    <iframe
      src={soundcloudEmbedUrl(url)}
      width="100%"
      height="166"
      allow="autoplay"
      loading="lazy"
      style={{ border: 'none' }}
    />
  )
}

function FacebookEmbed({ url }: { url: string }) {
  return (
    <iframe
      src={facebookEmbedUrl(url)}
      width="100%"
      height="314"
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      allowFullScreen
      loading="lazy"
      style={{ border: 'none' }}
    />
  )
}

function MapsLinkCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-[var(--bg2)] hover:bg-[var(--bg)] transition-colors group"
    >
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <MapPin className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium text-[var(--fg)] truncate">Ouvrir dans Google Maps</span>
        <span className="text-xs text-[var(--fg)]/50 truncate font-supplymono">{url}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-[var(--fg)]/40 shrink-0 ml-auto group-hover:text-[var(--fg)]/70 transition-colors" />
    </a>
  )
}

// ─── MediaEmbed ───────────────────────────────────────────────────────────────

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

    case 'facebook':
      return <FacebookEmbed url={url} />

    case 'spotify':
      return <SpotifyEmbed url={url} />

    case 'soundcloud':
      return <SoundCloudEmbed url={url} />

    case 'maps':
      return <MapsLinkCard url={url} />

    default:
      return (
        <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
          <p>Type de média non supporté.</p>
        </div>
      )
  }
}
