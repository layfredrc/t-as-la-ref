'use client'

import { FormEvent, useMemo, useState } from 'react'
import ReactPlayer from 'react-player'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { AlertTriangle } from 'lucide-react'
import { VideoPlayer } from './VideoPlayer'

type VideoEmbedFieldProps = {
  className?: string
  defaultUrl?: string
  onSubmit?: (payload: { url: string; playable: boolean }) => void
}

const isPlayable = (url: string) => ReactPlayer.canPlay(url)

export const VideoEmbedField = ({ className, defaultUrl = '', onSubmit }: VideoEmbedFieldProps) => {
  const [draftUrl, setDraftUrl] = useState(defaultUrl)
  const [previewUrl, setPreviewUrl] = useState(defaultUrl)

  const playable = useMemo(() => (previewUrl ? isPlayable(previewUrl) : true), [previewUrl])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUrl = draftUrl.trim()
    setPreviewUrl(nextUrl)
    onSubmit?.({ url: nextUrl, playable: isPlayable(nextUrl) })
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Coller le lien de la vidéo</CardTitle>
        <CardDescription>
          Ajoutez une URL TikTok, YouTube ou un lien public compatible (MP4, Vimeo, etc.). Nous utilisons le lecteur vidéo pour
          prévisualiser immédiatement le contenu.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='video-url'>Lien de la vidéo</Label>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Input
                id='video-url'
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                placeholder='https://www.tiktok.com/@user/video/123... ou https://youtube.com/watch?v=...'
                inputMode='url'
                className='flex-1'
              />
              <Button type='submit' className='sm:w-36'>
                Prévisualiser
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>Les liens publics sont nécessaires pour afficher la prévisualisation.</p>
          </div>
        </form>

        {previewUrl && !playable && (
          <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
            <AlertTriangle className='h-5 w-5 shrink-0' aria-hidden />
            <p>Le lien ne semble pas compatible. Essayez un URL TikTok, YouTube ou un flux vidéo lisible.</p>
          </div>
        )}

        {previewUrl && playable && <VideoPlayer url={previewUrl} className='max-w-xl' />}
      </CardContent>
    </Card>
  )
}
