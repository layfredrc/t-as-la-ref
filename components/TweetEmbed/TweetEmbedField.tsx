'use client'

import { FormEvent, useState } from 'react'

import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { TweetEmbed } from './TweetEmbed'

type TweetEmbedFieldProps = {
  className?: string
  defaultUrl?: string
  onSubmit?: (url: string) => void
}

export const TweetEmbedField = ({ className, defaultUrl = '', onSubmit }: TweetEmbedFieldProps) => {
  const [draftUrl, setDraftUrl] = useState(defaultUrl)
  const [previewUrl, setPreviewUrl] = useState(defaultUrl)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextUrl = draftUrl.trim()
    setPreviewUrl(nextUrl)
    onSubmit?.(nextUrl)
  }

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle>Coller le lien du post</CardTitle>
        <CardDescription>
          Ajoutez une URL Twitter/X (ex. https://x.com/username/status/123456) pour prévisualiser le tweet avant
          de la soumettre.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='tweet-url'>Lien du post</Label>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Input
                id='tweet-url'
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                placeholder='https://x.com/username/status/123456'
                inputMode='url'
                className='flex-1'
              />
              <Button type='submit' className='sm:w-36'>
                Prévisualiser
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>Seuls les liens Twitter/X publics sont pris en charge.</p>
          </div>
        </form>

        <TweetEmbed url={previewUrl} />
      </CardContent>
    </Card>
  )
}
