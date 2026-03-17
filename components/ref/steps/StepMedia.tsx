'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { detectMediaType, mediaTypeLabels } from '@/lib/utils/detectMediaType'
import { MediaEmbed } from '@/components/ref/MediaEmbed'
import { MediaSourcePicker } from '@/components/ref/MediaSourcePicker'
import type { AddRefFormData, MediaSourceType } from '@/lib/types'
import { cn } from '@/lib/utils'

// Types where a URL is required and must be detected
const URL_REQUIRED = new Set<MediaSourceType>(['video', 'tweet', 'audio'])

// Types where text is sufficient — URL optional, embed shown if detected
const TEXT_OK = new Set<MediaSourceType>(['expression', 'image', 'outfit', 'location'])

const URL_PLACEHOLDERS: Record<MediaSourceType, string> = {
  video: 'Colle le lien (TikTok, YouTube, Reels...)',
  tweet: 'Colle le lien du tweet ou du thread',
  audio: 'Colle le lien Spotify ou SoundCloud',
  expression: 'Le mot, la vanne, la phrase — décris-la ou colle un lien',
  location: 'Colle le lien Google Maps ou décris le lieu',
  image: "Colle le lien de l'image ou du meme",
  outfit: 'Colle un lien ou décris le vêtement / la pièce',
}

type StepMediaProps = {
  formData: AddRefFormData
  onNext: (patch: Partial<AddRefFormData>) => void
}

export function StepMedia({ formData, onNext }: StepMediaProps) {
  const [mediaSource, setMediaSource] = useState<MediaSourceType | null>(formData.mediaSource)
  const [input, setInput] = useState(formData.media_url)
  const [previewUrl, setPreviewUrl] = useState(formData.media_url)
  const [error, setError] = useState<string | null>(null)

  const isTextOk = mediaSource ? TEXT_OK.has(mediaSource) : false
  const isUrlRequired = mediaSource ? URL_REQUIRED.has(mediaSource) : false

  const detectedType = previewUrl ? detectMediaType(previewUrl) : null
  const mediaLabel = detectedType ? mediaTypeLabels[detectedType] : null

  const inputVisible = mediaSource !== null

  // Text-ok: can proceed as soon as something is typed
  // URL-required: need a valid detected media type
  const canProceed = isTextOk ? input.trim().length > 0 : Boolean(previewUrl && detectedType)

  const handlePreview = () => {
    const trimmed = input.trim()
    if (!trimmed) {
      setError('Colle une URL pour continuer.')
      return
    }
    const type = detectMediaType(trimmed)
    if (!type) {
      setError(
        'On capte pas la ref… Essaie avec un lien YouTube, TikTok, Spotify, Twitter/X ou Instagram.',
      )
      setPreviewUrl('')
      return
    }
    setError(null)
    setPreviewUrl(trimmed)
  }

  const handleNext = () => {
    const trimmed = input.trim()

    if (isTextOk) {
      // No URL validation needed — store text as-is
      const type = detectMediaType(trimmed) // optional: detected if it happens to be a URL
      onNext({ mediaSource, media_url: trimmed, media_type: type ?? null })
      return
    }

    // URL-required path
    const type = detectMediaType(trimmed)
    if (!trimmed || !type) {
      setError('Ajoute une URL valide avant de continuer.')
      return
    }
    onNext({ mediaSource, media_url: trimmed, media_type: type })
  }

  const showEmbed = !isTextOk && previewUrl && detectedType && !error

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold'>Ça vient d'où ?</h2>
        <p className='text-muted-foreground text-sm'>
          Choisis le type de média, puis colle le lien.
        </p>
      </div>

      {/* Source picker */}
      <MediaSourcePicker
        selected={mediaSource}
        onSelect={(type) => {
          setMediaSource(type)
          setInput('')
          setPreviewUrl('')
          setError(null)
        }}
      />

      {/* Input section — slides in after source selected */}
      <div
        className='transition-all duration-300 ease-in-out'
        style={{
          maxHeight: inputVisible ? '1800px' : '0px',
          opacity: inputVisible ? 1 : 0,
        }}
      >
        <div className='flex flex-col gap-2 pt-1'>
          {/* Text-ok: textarea. URL-required: input + preview button */}
          {isTextOk ? (
            <Textarea
              autoFocus={inputVisible}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mediaSource ? URL_PLACEHOLDERS[mediaSource] : ''}
              rows={3}
              className='resize-none'
            />
          ) : (
            <div className='flex gap-2'>
              <Input
                autoFocus={inputVisible}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError(null)
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text').trim()
                  setTimeout(() => {
                    const type = detectMediaType(pasted)
                    if (type) {
                      setError(null)
                      setPreviewUrl(pasted)
                    }
                  }, 50)
                }}
                placeholder={mediaSource ? URL_PLACEHOLDERS[mediaSource] : 'Colle le lien...'}
                inputMode='url'
                className='flex-1'
              />
              <Button type='button' variant='secondary' onClick={handlePreview}>
                Prévisualiser
              </Button>
            </div>
          )}

          {/* Platform badge — URL mode only */}
          {isUrlRequired && mediaLabel && !error && (
            <div className='flex items-center gap-1.5'>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full text-white',
                  mediaLabel.color,
                )}
              >
                {mediaLabel.emoji} {mediaLabel.label} détecté
              </span>
            </div>
          )}

          {/* For text-ok with detected URL (e.g. Maps link pasted in location) */}
          {isTextOk && detectedType && previewUrl && !error && (
            <div className='flex items-center gap-1.5'>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full text-white',
                  mediaLabel?.color,
                )}
              >
                {mediaLabel?.emoji} {mediaLabel?.label} détecté
              </span>
            </div>
          )}

          {error && (
            <div className='flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
              <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5' aria-hidden />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Embed preview — URL-required mode, or text-ok with detected URL */}
        {showEmbed && (
          <div className='mt-4 flex justify-center'>
            <MediaEmbed url={previewUrl} mediaType={detectedType} />
          </div>
        )}

        {/* Maps preview in location text-ok mode */}
        {isTextOk && mediaSource === 'location' && previewUrl && detectedType === 'maps' && (
          <div className='mt-4'>
            <MediaEmbed url={previewUrl} mediaType='maps' />
          </div>
        )}

        <Button onClick={handleNext} disabled={!canProceed} className='w-full mt-4'>
          Suivant →
        </Button>
      </div>

      {/* CTA when no source selected yet */}
      {!inputVisible && (
        <p className='text-center text-sm text-muted-foreground'>
          Sélectionne un type pour continuer
        </p>
      )}
    </div>
  )
}
