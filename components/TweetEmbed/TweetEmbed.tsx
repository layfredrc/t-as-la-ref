'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const SUPPORTED_HOSTNAMES = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'])

let twitterScriptPromise: Promise<void> | null = null

const loadTwitterWidgets = () => {
  if (typeof window === 'undefined') return Promise.resolve()

  if (window.twttr?.widgets) {
    return Promise.resolve()
  }

  if (twitterScriptPromise) return twitterScriptPromise

  twitterScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://platform.twitter.com/widgets.js"]',
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Twitter widgets failed to load')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://platform.twitter.com/widgets.js'
    script.charset = 'utf-8'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Twitter widgets failed to load'))

    document.body.appendChild(script)
  })

  return twitterScriptPromise
}

const getTweetIdFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    if (!SUPPORTED_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
      return null
    }

    const segments = parsed.pathname.split('/').filter(Boolean)
    const statusIndex = segments.indexOf('status')

    if (statusIndex === -1 || statusIndex === segments.length - 1) {
      return null
    }

    const tweetId = segments[statusIndex + 1]?.split('?')[0]

    return /^\d+$/.test(tweetId) ? tweetId : null
  } catch (error) {
    console.error('Invalid Twitter/X URL', error)
    return null
  }
}

const TWITTER_ERROR_MESSAGE = 'Ce tweet ne peut pas être affiché (post privé ou inexistant).'
const INVALID_URL_MESSAGE = "L'URL fournie n'est pas reconnue comme un lien Twitter/X."

type TweetEmbedProps = {
  url?: string
  className?: string
}

export const TweetEmbed = ({ url, className }: TweetEmbedProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const tweetId = useMemo(() => {
    if (!url) return null
    return getTweetIdFromUrl(url)
  }, [url])

  useEffect(() => {
    let isCancelled = false
    const container = containerRef.current

    if (!container) return

    container.innerHTML = ''

    if (!url) {
      setErrorMessage(null)
      setIsLoading(false)
      return
    }

    if (!tweetId) {
      setErrorMessage(INVALID_URL_MESSAGE)
      setIsLoading(false)
      return
    }

    const renderTweet = async () => {
      setErrorMessage(null)
      setIsLoading(true)

      try {
        await loadTwitterWidgets()

        if (isCancelled || !containerRef.current) return

        const result = await window.twttr?.widgets?.createTweet(tweetId, containerRef.current, {
          align: 'center',
        })

        if (!result && !isCancelled) {
          setErrorMessage(TWITTER_ERROR_MESSAGE)
        }
      } catch (error) {
        console.error(error)
        if (!isCancelled) {
          setErrorMessage(TWITTER_ERROR_MESSAGE)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    renderTweet()

    return () => {
      isCancelled = true
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [tweetId, url])

  const showPlaceholder = !url || !tweetId

  return (
    <div className={cn('relative w-full', className)}>
      {showPlaceholder && !errorMessage && (
        <div className='border rounded-xl border-border bg-muted/40 text-muted-foreground p-4 text-sm'>
          Collez un lien Twitter/X pour voir un aperçu du tweet.
        </div>
      )}

      {errorMessage && (
        <div className='border rounded-xl border-destructive/30 bg-destructive/10 text-destructive p-4 text-sm flex gap-2'>
          <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
          <p>{errorMessage}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className={cn(
          'min-h-[200px] w-full',
          (isLoading || errorMessage || showPlaceholder) && 'flex items-center justify-center',
        )}
        aria-busy={isLoading}
      />

      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <div className='flex items-center gap-2 rounded-full bg-background/70 px-3 py-2 shadow-sm'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='text-sm'>Chargement du tweet…</span>
          </div>
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        createTweet: (
          tweetId: string,
          element: HTMLElement,
          options?: Record<string, unknown>,
        ) => Promise<HTMLElement | void>
        load: (element?: HTMLElement) => void
      }
    }
  }
}
