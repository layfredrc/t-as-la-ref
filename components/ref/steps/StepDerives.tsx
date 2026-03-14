'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'
import { detectMediaType } from '@/lib/utils/detectMediaType'
import type { AddRefFormData } from '@/lib/types'

type StepDerivesProps = {
  formData: AddRefFormData
  onNext: (patch: Partial<AddRefFormData>) => void
  onBack: () => void
}

export function StepDerives({ formData, onNext, onBack }: StepDerivesProps) {
  const [derives, setDerives] = useState<string[]>(
    formData.derives.length > 0 ? formData.derives : [''],
  )

  const handleChange = (index: number, value: string) => {
    setDerives((prev) => prev.map((d, i) => (i === index ? value : d)))
  }

  const handleAdd = () => {
    if (derives.length < 3) setDerives((prev) => [...prev, ''])
  }

  const handleRemove = (index: number) => {
    setDerives((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    const valid = derives.map((d) => d.trim()).filter(Boolean)
    onNext({ derives: valid })
  }

  const handleSkip = () => {
    onNext({ derives: [] })
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold'>Des dérivés ? <span className='text-muted-foreground font-normal text-lg'>(optionnel)</span></h2>
        <p className='text-muted-foreground text-sm'>
          D&apos;autres formats de cette ref : version meme, remix, réaction… Max 3 URLs.
        </p>
      </div>

      <div className='flex flex-col gap-3'>
        {derives.map((url, index) => {
          const type = url.trim() ? detectMediaType(url.trim()) : null
          return (
            <div key={index} className='flex items-center gap-2'>
              <Input
                value={url}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={`Lien dérivé ${index + 1}`}
                inputMode='url'
                className='flex-1'
              />
              {type && (
                <span className='text-xs text-muted-foreground shrink-0 capitalize'>{type}</span>
              )}
              {derives.length > 1 && (
                <button
                  type='button'
                  onClick={() => handleRemove(index)}
                  className='text-muted-foreground hover:text-destructive transition-colors'
                  aria-label='Supprimer'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>
          )
        })}

        {derives.length < 3 && (
          <button
            type='button'
            onClick={handleAdd}
            className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start'
          >
            <Plus className='h-4 w-4' />
            Ajouter un dérivé
          </button>
        )}
      </div>

      <div className='flex gap-3'>
        <Button variant='ghost' onClick={onBack} className='flex-1'>
          ← Retour
        </Button>
        <Button variant='outline' onClick={handleSkip} className='flex-1'>
          Passer
        </Button>
        <Button onClick={handleNext} className='flex-1'>
          Prévisualiser →
        </Button>
      </div>
    </div>
  )
}
