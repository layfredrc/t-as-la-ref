'use client'

import { useState, type RefObject } from 'react'
import { AlertTriangle, Loader2, MapPin, ExternalLink } from 'lucide-react'
import type { MediaType } from '@/lib/types'
import { VideoPlayer } from '@/components/VideoPlayer/VideoPlayer'
import { TweetEmbed } from '@/components/TweetEmbed/TweetEmbed'
import { MetaEmbed } from '@/components/MetaEmbed/MetaEmbed'

// ─── URL transformers ─────────────────────────────────────────────────────────

const SPOTIFY_HOSTNAMES = new Set([
  'open.spotify.com',
  'www.open.spotify.com',
  'spotify.link',
  'spotify.app.link',
])

const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'episode', 'show'] as const
type SpotifyType = (typeof SPOTIFY_TYPES)[number]

/**
 * Découpe une URL Spotify en type + identifiant.
 *
 * Le chemin peut porter un préfixe de langue (`/intl-fr/track/…`) ou être déjà
 * une URL d'embed : on cherche donc le segment de type plutôt que de supposer
 * sa position.
 */
function parseSpotifyUrl(raw: string): { type: SpotifyType; id: string } | null {
  try {
    const url = new URL(raw)
    if (!SPOTIFY_HOSTNAMES.has(url.hostname)) return null

    const segments = url.pathname.split('/').filter(Boolean)
    // `find` sur le tuple conserve le type de l'élément, là où `findIndex`
    // rendrait un `string` qu'il faudrait caster.
    const type = SPOTIFY_TYPES.find((candidate) => segments.includes(candidate))
    if (!type) return null

    const id = segments[segments.indexOf(type) + 1]?.split('?')[0]
    return id ? { type, id } : null
  } catch {
    return null
  }
}

const SOUNDCLOUD_HOSTNAMES = new Set([
  'soundcloud.com',
  'www.soundcloud.com',
  'm.soundcloud.com',
  'on.soundcloud.com',
])

function parseSoundcloudUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    return SOUNDCLOUD_HOSTNAMES.has(url.hostname) ? url.toString() : null
  } catch {
    return null
  }
}

function soundcloudEmbedUrl(url: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&visual=true`
}

function facebookEmbedUrl(url: string): string {
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`
}

// ─── Sub-embeds ───────────────────────────────────────────────────────────────

/**
 * Cadre commun aux lecteurs audio.
 *
 * Un embed audio met un instant à répondre, et une URL mal collée ne donne
 * qu'un rectangle vide : les deux lecteurs affichent donc un chargement puis,
 * le cas échéant, une erreur lisible — ce que le CLAUDE.md demande pour tout
 * état (loading / error / empty).
 */
function AudioFrame({
  src,
  height,
  title,
  allow,
}: {
  src: string
  height: number
  title: string
  allow: string
}) {
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(false)

  if (erreur)
    return (
      <EmbedError message={`Ce contenu ${title} ne peut pas être lu (lien privé ou supprimé).`} />
    )

  return (
    <div className='relative w-full overflow-hidden rounded-xl'>
      <iframe
        src={src}
        width='100%'
        height={height}
        allow={allow}
        loading='lazy'
        title={`Lecteur ${title}`}
        className='w-full rounded-xl'
        style={{ border: 'none' }}
        onLoad={() => setChargement(false)}
        onError={() => {
          setChargement(false)
          setErreur(true)
        }}
      />

      {chargement && (
        <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-[var(--bg2)]'>
          <span className='flex items-center gap-2 font-supplymono text-sm text-[var(--fg)]/70'>
            <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
            Chargement du lecteur…
          </span>
        </div>
      )}
    </div>
  )
}

function EmbedError({ message }: { message: string }) {
  return (
    <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
      <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
      <p>{message}</p>
    </div>
  )
}

function SpotifyEmbed({ url }: { url: string }) {
  const parsed = parseSpotifyUrl(url)

  if (!parsed) {
    return <EmbedError message="Ce lien n'est pas reconnu comme une URL Spotify valide." />
  }

  return (
    <AudioFrame
      src={`https://open.spotify.com/embed/${parsed.type}/${parsed.id}`}
      // Un morceau tient dans la barre compacte ; un album, une playlist ou un
      // épisode affichent une liste, que 152px tronquaient.
      height={parsed.type === 'track' ? 152 : 352}
      title='Spotify'
      allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
    />
  )
}

function SoundCloudEmbed({ url }: { url: string }) {
  const normalized = parseSoundcloudUrl(url)

  if (!normalized) {
    return <EmbedError message="Ce lien n'est pas reconnu comme une URL SoundCloud valide." />
  }

  return (
    <AudioFrame
      src={soundcloudEmbedUrl(normalized)}
      height={166}
      title='SoundCloud'
      allow='autoplay'
    />
  )
}

function FacebookEmbed({ url }: { url: string }) {
  return (
    <iframe
      src={facebookEmbedUrl(url)}
      width='100%'
      height='314'
      allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'
      allowFullScreen
      loading='lazy'
      style={{ border: 'none' }}
    />
  )
}

function mapsEmbedUrl(url: string): string | null {
  // /place/Place+Name/@lat,lng → prefer place name for readability
  const placeMatch = url.match(/\/place\/([^/@?]+)/)
  if (placeMatch) {
    const name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&output=embed`
  }
  // @lat,lng anywhere in the URL
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`
  }
  // ?q=... or &q=... param
  const qMatch = url.match(/[?&]q=([^&]+)/)
  if (qMatch) {
    return `https://maps.google.com/maps?q=${qMatch[1]}&output=embed`
  }
  return null
}

function MapsEmbed({ url }: { url: string }) {
  const embedSrc = mapsEmbedUrl(url)

  if (!embedSrc) {
    // Short links (maps.app.goo.gl) can't be parsed client-side — fall back to link card
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-3 p-4 rounded-xl border border-border bg-[var(--bg2)] hover:bg-[var(--bg)] transition-colors group'
      >
        <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0'>
          <MapPin className='w-5 h-5 text-blue-600' />
        </div>
        <div className='flex flex-col gap-0.5 min-w-0'>
          <span className='text-sm font-medium text-[var(--fg)] truncate'>
            Ouvrir dans Google Maps
          </span>
          <span className='text-xs text-[var(--fg)]/50 truncate font-supplymono'>{url}</span>
        </div>
        <ExternalLink className='w-4 h-4 text-[var(--fg)]/40 shrink-0 ml-auto group-hover:text-[var(--fg)]/70 transition-colors' />
      </a>
    )
  }

  return (
    <div className='flex flex-col gap-2'>
      <iframe
        src={embedSrc}
        width='100%'
        height='300'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        className='rounded-xl border border-border'
        style={{ border: 'none' }}
        title='Google Maps'
      />
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-1.5 text-xs text-[var(--fg)]/50 hover:text-[var(--fg)]/80 transition-colors w-fit font-supplymono'
      >
        <ExternalLink className='w-3 h-3' />
        Ouvrir dans Google Maps
      </a>
    </div>
  )
}

// ─── MediaEmbed ───────────────────────────────────────────────────────────────

type MediaEmbedProps = {
  url: string
  mediaType: MediaType
  playing?: boolean
  /** Démarrage muet — voir VideoPlayer, c'est ce qui rend l'autoplay légal. */
  muted?: boolean
  /**
   * Barre de contrôle du lecteur. Seul le feed la coupe : il recouvre l'embed
   * pour capter le swipe, et fournit ses propres commandes (voir `RefCard`).
   */
  controls?: boolean
  className?: string
  /** Transmis au lecteur vidéo pour le contrôle direct (voir VideoPlayer). */
  playerRef?: RefObject<HTMLVideoElement | null>
}

export function MediaEmbed({
  url,
  mediaType,
  playing,
  muted,
  controls,
  className,
  playerRef,
}: MediaEmbedProps) {
  switch (mediaType) {
    case 'youtube':
    case 'tiktok':
    case 'video':
      return (
        <VideoPlayer
          url={url}
          mediaType={mediaType}
          playing={playing}
          muted={muted}
          controls={controls}
          className={className}
          playerRef={playerRef}
        />
      )

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
      return <MapsEmbed url={url} />

    default:
      return <EmbedError message='Type de média non supporté.' />
  }
}
