'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { RefCardPreview } from '@/components/ref/RefCard'
import type { AddRefFormData, TagsByType } from '@/lib/types'
import { useTags } from '@/queryOptions/getTags'

type StepPreviewProps = {
  formData: AddRefFormData
  onBack: () => void
}

export function StepPreview({ formData, onBack }: StepPreviewProps) {
  const router = useRouter()
  const { data: tags } = useTags()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = async () => {
    if (!formData.media_type || !formData.tag_type_ref || !formData.tag_origine || !formData.tag_vibe) {
      setError('Données incomplètes. Reviens en arrière et vérifie le formulaire.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/refs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: formData.titre,
          media_url: formData.media_url,
          media_type: formData.media_type,
          contexte: formData.contexte || undefined,
          tag_ids: [formData.tag_type_ref, formData.tag_origine, formData.tag_vibe],
          derives: formData.derives.length > 0 ? formData.derives : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de la publication.')
        setLoading(false)
        return
      }

      router.push(`/ref/${data.slug}`)
    } catch {
      setError('Erreur réseau. Réessaie.')
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold'>Aperçu de ta ref</h2>
        <p className='text-muted-foreground text-sm'>
          C&apos;est exactement comme ça qu&apos;elle apparaîtra dans le feed.
        </p>
      </div>

      {tags && (
        <div className='flex justify-center'>
          <RefCardPreview formData={formData} tags={tags} />
        </div>
      )}

      {error && (
        <p className='text-sm text-destructive text-center'>{error}</p>
      )}

      <div className='flex gap-3'>
        <Button variant='ghost' onClick={onBack} disabled={loading} className='flex-1'>
          ← Retour
        </Button>
        <Button onClick={handlePublish} disabled={loading} className='flex-1'>
          {loading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
              Publication…
            </>
          ) : (
            'Publier la ref 🚀'
          )}
        </Button>
      </div>
    </div>
  )
}
