'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const SPOTIFY_HOSTNAMES = new Set([
  'open.spotify.com',
  'www.open.spotify.com',
  'spotify.link',
  'spotify.app.link',
])

const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'episode', 'show'] as const

type SpotifyType = (typeof SPOTIFY_TYPES)[number]

type SpotifyEmbedProps = {
  url?: string
  className?: string
  height?: number
}

const INVALID_URL_MESSAGE = "L'URL fournie n'est pas reconnue comme un lien Spotify valide."
const UNSUPPORTED_MESSAGE = "Ce contenu Spotify ne peut pas être affiché (type non supporté ou contenu privé)."

const parseSpotifyUrl = (rawUrl?: string): { type: SpotifyType; id: string } | null => {
  if (!rawUrl) return null

  try {
    const url = new URL(rawUrl)

    if (!SPOTIFY_HOSTNAMES.has(url.hostname)) return null

    const segments = url.pathname.split('/').filter(Boolean)
    const type = segments[0] as SpotifyType | undefined
    const idWithQuery = segments[1]

    if (!type || !SPOTIFY_TYPES.includes(type)) return null
    if (!idWithQuery) return null

    const id = idWithQuery.split('?')[0]

    return { type, id }
  } catch (error) {
    console.error('Invalid Spotify URL', error)
    return null
  }
}

export const SpotifyEmbed = ({ url, className, height }: SpotifyEmbedProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const parsedUrl = useMemo(() => parseSpotifyUrl(url), [url])
  const iframeSrc = useMemo(() => {
    if (!parsedUrl) return null
    return `https://open.spotify.com/embed/${parsedUrl.type}/${parsedUrl.id}`
  }, [parsedUrl])

  useEffect(() => {
    if (!url) {
      setErrorMessage(null)
      setIsLoading(false)
      setHasLoadedOnce(false)
      return
    }

    if (!parsedUrl) {
      setErrorMessage(INVALID_URL_MESSAGE)
      setIsLoading(false)
      setHasLoadedOnce(false)
      return
    }

    setErrorMessage(null)
    setIsLoading(true)
    setHasLoadedOnce(false)
  }, [parsedUrl, url])

  const resolvedHeight = height ?? (parsedUrl?.type === 'track' ? 152 : 352)

  return (
    <div className={cn('relative w-full', className)}>
      {!url && !errorMessage && (
        <div className='border rounded-xl border-border bg-muted/40 text-muted-foreground p-4 text-sm'>
          Collez un lien Spotify (morceau, album ou playlist) pour voir le lecteur.
        </div>
      )}

      {errorMessage && (
        <div className='border rounded-xl border-destructive/30 bg-destructive/10 text-destructive p-4 text-sm flex gap-2'>
          <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
          <p>{errorMessage}</p>
        </div>
      )}

      {iframeSrc && !errorMessage && (
        <div className='relative overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <iframe
            src={iframeSrc}
            width='100%'
            height={resolvedHeight}
            frameBorder='0'
            allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
            loading='lazy'
            className='w-full rounded-xl'
            onLoad={() => {
              setIsLoading(false)
              setHasLoadedOnce(true)
            }}
            onError={() => {
              setErrorMessage(UNSUPPORTED_MESSAGE)
              setIsLoading(false)
            }}
            title='Spotify embed'
          />

          {isLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-background/70'>
              <div className='flex items-center gap-2 rounded-full bg-background/90 px-3 py-2 shadow-sm'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-sm'>Chargement du player…</span>
              </div>
            </div>
          )}
        </div>
      )}

      {hasLoadedOnce && !isLoading && !iframeSrc && !errorMessage && (
        <div className='border rounded-xl border-destructive/30 bg-destructive/10 text-destructive p-4 text-sm flex gap-2'>
          <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
          <p>{UNSUPPORTED_MESSAGE}</p>
        </div>
      )}
    </div>
  )
}
