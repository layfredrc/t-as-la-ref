'use client'

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react'
import { AlertTriangle, Hash } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { SpotifyEmbed } from './SpotifyEmbed'
import { SoundCloudEmbed } from './SoundCloudEmbed'

type SupportedPlatform = 'spotify' | 'soundcloud'

type AudioEmbedFieldProps = {
  className?: string
  defaultUrl?: string
  defaultNote?: string
  defaultTags?: string[]
  onSubmit?: (payload: { url: string; platform: SupportedPlatform | null; note: string; tags: string[] }) => void
}

const detectPlatformFromUrl = (rawUrl: string): SupportedPlatform | null => {
  const normalized = rawUrl.toLowerCase()

  if (normalized.includes('open.spotify.com') || normalized.includes('spotify.link')) {
    return 'spotify'
  }

  if (normalized.includes('soundcloud.com')) {
    return 'soundcloud'
  }

  return null
}

export const AudioEmbedField = ({
  className,
  defaultUrl = '',
  defaultNote = '',
  defaultTags = [],
  onSubmit,
}: AudioEmbedFieldProps) => {
  const [draftUrl, setDraftUrl] = useState(defaultUrl)
  const [previewUrl, setPreviewUrl] = useState(defaultUrl)
  const [note, setNote] = useState(defaultNote)
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [tagDraft, setTagDraft] = useState('')

  const platform = useMemo(() => detectPlatformFromUrl(previewUrl), [previewUrl])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUrl = draftUrl.trim()
    const nextPlatform = detectPlatformFromUrl(nextUrl)
    setPreviewUrl(nextUrl)
    onSubmit?.({ url: nextUrl, platform: nextPlatform, note, tags })
  }

  const handleTagAdd = () => {
    const trimmed = tagDraft.trim()
    if (!trimmed) return

    if (!tags.includes(trimmed)) {
      setTags((previous) => [...previous, trimmed])
    }

    setTagDraft('')
  }

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      handleTagAdd()
    }
  }

  const handleTagRemove = (value: string) => {
    setTags((previous) => previous.filter((tag) => tag !== value))
  }

  const unsupportedUrl = previewUrl && !platform

  return (
    <Card className={cn('w-full max-w-3xl', className)}>
      <CardHeader>
        <CardTitle>Coller le lien du morceau / playlist</CardTitle>
        <CardDescription>
          Collez une URL Spotify ou SoundCloud (morceau, playlist, album). Nous générons automatiquement le widget officiel
          pour prévisualiser la ref avant de la publier.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='audio-url'>Lien du morceau / playlist / album</Label>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Input
                id='audio-url'
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                placeholder='https://open.spotify.com/track/... ou https://soundcloud.com/artist/track'
                inputMode='url'
                className='flex-1'
              />
              <Button type='submit' className='sm:w-40'>
                Prévisualiser
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>Les liens publics Spotify/SoundCloud sont acceptés.</p>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='note'>Note perso</Label>
            <Textarea
              id='note'
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder='Pourquoi cette track est une ref ?'
              rows={3}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='tags'>Tags</Label>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col gap-3 sm:flex-row'>
                <div className='relative flex-1'>
                  <Hash className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='tags'
                    value={tagDraft}
                    onChange={(event) => setTagDraft(event.target.value.replace(/,/g, ''))}
                    onKeyDown={handleTagKeyDown}
                    placeholder='musique, trendSound, vibe...'
                    className='pl-9'
                  />
                </div>
                <Button type='button' variant='secondary' className='sm:w-40' onClick={handleTagAdd}>
                  Ajouter le tag
                </Button>
              </div>

              {tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag) => (
                    <Badge key={tag} variant='secondary' className='gap-2'>
                      #{tag}
                      <button type='button' className='text-xs text-muted-foreground hover:text-foreground' onClick={() => handleTagRemove(tag)}>
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {unsupportedUrl && (
          <div className='border rounded-xl border-destructive/30 bg-destructive/10 text-destructive p-4 text-sm flex gap-2'>
            <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
            <p>Lien non supporté. Merci d&apos;utiliser un URL Spotify ou SoundCloud public.</p>
          </div>
        )}

        {platform === 'spotify' && <SpotifyEmbed url={previewUrl} />}
        {platform === 'soundcloud' && <SoundCloudEmbed url={previewUrl} />}
      </CardContent>
    </Card>
  )
}
