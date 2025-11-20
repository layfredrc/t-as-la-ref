'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const SOUNDCLOUD_HOSTNAMES = new Set(['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com'])

const INVALID_URL_MESSAGE = "L'URL fournie n'est pas reconnue comme un lien SoundCloud valide."
const UNSUPPORTED_MESSAGE = 'Ce contenu SoundCloud ne peut pas être affiché (lien non public ou non supporté).'

type SoundCloudEmbedProps = {
  url?: string
  className?: string
  color?: string
  height?: number
}

const parseSoundCloudUrl = (rawUrl?: string) => {
  if (!rawUrl) return null

  try {
    const url = new URL(rawUrl)
    if (!SOUNDCLOUD_HOSTNAMES.has(url.hostname)) return null

    return url.toString()
  } catch (error) {
    console.error('Invalid SoundCloud URL', error)
    return null
  }
}

export const SoundCloudEmbed = ({ url, className, color = '#ff5500', height = 166 }: SoundCloudEmbedProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const normalizedUrl = useMemo(() => parseSoundCloudUrl(url), [url])
  const iframeSrc = useMemo(() => {
    if (!normalizedUrl) return null
    const encodedUrl = encodeURIComponent(normalizedUrl)
    const encodedColor = encodeURIComponent(color)

    return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=${encodedColor}`
  }, [color, normalizedUrl])

  useEffect(() => {
    if (!url) {
      setErrorMessage(null)
      setIsLoading(false)
      setHasLoadedOnce(false)
      return
    }

    if (!normalizedUrl) {
      setErrorMessage(INVALID_URL_MESSAGE)
      setIsLoading(false)
      setHasLoadedOnce(false)
      return
    }

    setErrorMessage(null)
    setIsLoading(true)
    setHasLoadedOnce(false)
  }, [normalizedUrl, url])

  return (
    <div className={cn('relative w-full', className)}>
      {!url && !errorMessage && (
        <div className='border rounded-xl border-border bg-muted/40 text-muted-foreground p-4 text-sm'>
          Collez un lien SoundCloud (piste ou playlist publique) pour voir le lecteur.
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
            width='100%'
            height={height}
            scrolling='no'
            frameBorder='no'
            allow='autoplay'
            src={iframeSrc}
            className='w-full rounded-xl'
            title='SoundCloud embed'
            onLoad={() => {
              setIsLoading(false)
              setHasLoadedOnce(true)
            }}
            onError={() => {
              setErrorMessage(UNSUPPORTED_MESSAGE)
              setIsLoading(false)
            }}
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
