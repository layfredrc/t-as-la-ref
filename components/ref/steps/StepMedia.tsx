'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { detectMediaType, mediaTypeLabels } from '@/lib/utils/detectMediaType'
import { MediaEmbed } from '@/components/ref/MediaEmbed'
import type { AddRefFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

type StepMediaProps = {
  formData: AddRefFormData
  onNext: (patch: Partial<AddRefFormData>) => void
}

export function StepMedia({ formData, onNext }: StepMediaProps) {
  const [url, setUrl] = useState(formData.media_url)
  const [previewUrl, setPreviewUrl] = useState(formData.media_url)
  const [error, setError] = useState<string | null>(null)

  const detectedType = previewUrl ? detectMediaType(previewUrl) : null
  const mediaLabel = detectedType ? mediaTypeLabels[detectedType] : null

  const handlePreview = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Colle une URL pour continuer.')
      return
    }
    const type = detectMediaType(trimmed)
    if (!type) {
      setError("On capte pas la ref… Essaie avec un lien YouTube, TikTok, Twitter/X ou Instagram.")
      setPreviewUrl('')
      return
    }
    setError(null)
    setPreviewUrl(trimmed)
  }

  const handleNext = () => {
    const trimmed = url.trim()
    const type = detectMediaType(trimmed)
    if (!trimmed || !type) {
      setError("Ajoute une URL valide avant de continuer.")
      return
    }
    onNext({ media_url: trimmed, media_type: type })
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold'>Quel est le média ?</h2>
        <p className='text-muted-foreground text-sm'>
          Colle le lien de la vidéo, du tweet ou du post — on détecte automatiquement.
        </p>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <Input
            autoFocus
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(null)
            }}
            onPaste={(e) => {
              // Auto-preview on paste
              const pasted = e.clipboardData.getData('text').trim()
              setTimeout(() => {
                const type = detectMediaType(pasted)
                if (type) {
                  setError(null)
                  setPreviewUrl(pasted)
                }
              }, 50)
            }}
            placeholder='https://www.youtube.com/watch?v=...'
            inputMode='url'
            className='flex-1'
          />
          <Button type='button' variant='secondary' onClick={handlePreview}>
            Prévisualiser
          </Button>
        </div>

        {/* Platform badge */}
        {mediaLabel && !error && (
          <div className='flex items-center gap-1.5'>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full text-white', mediaLabel.color)}>
              {mediaLabel.emoji} {mediaLabel.label} détecté
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

      {/* Embed preview */}
      {previewUrl && detectedType && !error && (
        <div className='rounded-xl overflow-hidden border border-border bg-black/20'>
          <MediaEmbed url={previewUrl} mediaType={detectedType} />
        </div>
      )}

      <Button onClick={handleNext} disabled={!previewUrl || !detectedType} className='w-full'>
        Suivant →
      </Button>
    </div>
  )
}
