'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'

const detectPlatformFromUrl = (rawUrl: string): 'instagram' | 'facebook' | null => {
  const normalized = rawUrl.toLowerCase()

  if (normalized.includes('instagram.com')) return 'instagram'
  if (normalized.includes('facebook.com') || normalized.includes('fb.watch')) return 'facebook'

  return null
}

type EmbedResponse = {
  html: string
  platform: 'instagram' | 'facebook'
}

type MetaEmbedProps = {
  url: string
  className?: string
}

export const MetaEmbed = ({ url, className }: MetaEmbedProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [embed, setEmbed] = useState<EmbedResponse | null>(null)

  const platform = useMemo(() => detectPlatformFromUrl(url), [url])

  useEffect(() => {
    let isCancelled = false

    const fetchEmbed = async () => {
      if (!url || !platform) {
        setEmbed(null)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/meta-oembed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        if (isCancelled) return

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          setError(payload?.error ?? "Impossible d'afficher l'embed (lien privé ou non autorisé).")
          setEmbed(null)
          return
        }

        const payload = (await response.json()) as EmbedResponse
        setEmbed(payload)
      } catch (fetchError) {
        if (isCancelled) return
        console.error(fetchError)
        setError("Erreur réseau lors de l'appel à l'API Meta oEmbed.")
        setEmbed(null)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchEmbed()

    return () => {
      isCancelled = true
    }
  }, [platform, url])

  useEffect(() => {
    if (!embed?.html) return

    const needsInstagram = embed.platform === 'instagram'
    const needsFacebook = embed.platform === 'facebook'

    if (needsInstagram) {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.instagram.com/embed.js"]',
      )

      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://www.instagram.com/embed.js'
        script.async = true
        script.onload = () => {
          ;(window as any)?.instgrm?.Embeds?.process?.()
        }
        document.body.appendChild(script)
      } else {
        ;(window as any)?.instgrm?.Embeds?.process?.()
      }
    }

    if (needsFacebook) {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src^="https://connect.facebook.net/"]',
      )

      if (!existingScript) {
        const script = document.createElement('script')
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v12.0'
        script.async = true
        script.defer = true
        script.crossOrigin = 'anonymous'
        script.onload = () => {
          ;(window as any)?.FB?.XFBML?.parse?.()
        }
        document.body.appendChild(script)
      } else {
        ;(window as any)?.FB?.XFBML?.parse?.()
      }
    }
  }, [embed])

  if (!url) return null

  if (!platform) {
    return (
      <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
        <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
        <p>Seuls les liens Instagram ou Facebook publics sont pris en charge.</p>
      </div>
    )
  }

  return (
    <div className={cn('flex w-full max-w-2xl flex-col gap-3', className)}>
      {loading && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
          <span>Chargement de l&apos;aperçu officiel…</span>
        </div>
      )}

      {error && (
        <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
          <p>{error}</p>
        </div>
      )}

      {embed?.html && !error && (
        <div
          className='overflow-hidden rounded-xl border bg-card p-2 shadow-sm'
          dangerouslySetInnerHTML={{ __html: embed.html }}
        />
      )}
    </div>
  )
}

type MetaEmbedFieldProps = {
  className?: string
  defaultUrl?: string
  onSubmit?: (payload: { url: string; platform: 'instagram' | 'facebook' | null }) => void
}

export const MetaEmbedField = ({ className, defaultUrl = '', onSubmit }: MetaEmbedFieldProps) => {
  const [draftUrl, setDraftUrl] = useState(defaultUrl)
  const [previewUrl, setPreviewUrl] = useState(defaultUrl)

  const platform = useMemo(() => detectPlatformFromUrl(previewUrl), [previewUrl])
  const unsupported = previewUrl && !platform

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUrl = draftUrl.trim()
    setPreviewUrl(nextUrl)
    onSubmit?.({ url: nextUrl, platform: detectPlatformFromUrl(nextUrl) })
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Coller le lien Instagram ou Facebook</CardTitle>
        <CardDescription>
          Collez un post public Instagram ou Facebook. Nous interrogeons l&apos;API Meta oEmbed (avec jeton protégé côté serveur)
          et affichons le rendu officiel.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='meta-url'>Lien du post</Label>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Input
                id='meta-url'
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                placeholder='https://www.instagram.com/p/... ou https://www.facebook.com/...'
                inputMode='url'
                className='flex-1'
              />
              <Button type='submit' className='sm:w-36'>
                Prévisualiser
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>Seuls les posts publics sont éligibles. Les comptes non autorisés voient une erreur.</p>
          </div>
        </form>

        {unsupported && (
          <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
            <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
            <p>Lien non reconnu. Merci d&apos;utiliser une URL Instagram ou Facebook.</p>
          </div>
        )}

        <MetaEmbed url={previewUrl} />
      </CardContent>
    </Card>
  )
}
