'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { TagSelector } from '@/components/ref/TagSelector'
import { useTags } from '@/queryOptions/getTags'
import { Loader2 } from 'lucide-react'
import type { AddRefFormData } from '@/lib/types'

type StepRefProps = {
  formData: AddRefFormData
  onNext: (patch: Partial<AddRefFormData>) => void
  onBack: () => void
}

export function StepRef({ formData, onNext, onBack }: StepRefProps) {
  const { data: tags, isLoading: tagsLoading } = useTags()

  const [titre, setTitre] = useState(formData.titre)
  const [contexte, setContexte] = useState(formData.contexte)
  const [tagTypeRef, setTagTypeRef] = useState<string | null>(formData.tag_type_ref)
  const [tagOrigine, setTagOrigine] = useState<string | null>(formData.tag_origine)
  const [tagVibe, setTagVibe] = useState<string | null>(formData.tag_vibe)
  const [errors, setErrors] = useState<string[]>([])

  const handleNext = () => {
    const errs: string[] = []
    if (!titre.trim()) errs.push('Le titre est obligatoire.')
    if (!tagTypeRef) errs.push('Choisis un type de ref.')
    if (!tagOrigine) errs.push("Choisis une origine.")
    if (!tagVibe) errs.push('Choisis une vibe.')
    if (errs.length) {
      setErrors(errs)
      return
    }
    setErrors([])
    onNext({
      titre: titre.trim(),
      contexte: contexte.trim(),
      tag_type_ref: tagTypeRef,
      tag_origine: tagOrigine,
      tag_vibe: tagVibe,
    })
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold'>C&apos;est quoi cette ref ?</h2>
        <p className='text-muted-foreground text-sm'>Donne lui un nom, un contexte, et classe-la.</p>
      </div>

      {/* Titre */}
      <div className='flex flex-col gap-1.5'>
        <div className='flex justify-between items-center'>
          <label className='text-sm font-medium' htmlFor='titre'>
            Titre *
          </label>
          <span className='text-xs text-muted-foreground'>{titre.length}/60</span>
        </div>
        <Input
          id='titre'
          value={titre}
          onChange={(e) => setTitre(e.target.value.slice(0, 60))}
          placeholder='Ex : "Oh PTN Laurent"'
          autoFocus
        />
      </div>

      {/* Tags */}
      {tagsLoading ? (
        <div className='flex items-center gap-2 text-muted-foreground text-sm'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Chargement des tags…
        </div>
      ) : tags ? (
        <div className='flex flex-col gap-5'>
          <TagSelector
            label='Type de ref *'
            tags={tags.type_ref}
            selected={tagTypeRef}
            onChange={setTagTypeRef}
          />
          <TagSelector
            label='Origine *'
            tags={tags.origine}
            selected={tagOrigine}
            onChange={setTagOrigine}
          />
          <TagSelector
            label='Vibe *'
            tags={tags.vibe}
            selected={tagVibe}
            onChange={setTagVibe}
          />
        </div>
      ) : null}

      {/* Contexte */}
      <div className='flex flex-col gap-1.5'>
        <div className='flex justify-between items-center'>
          <label className='text-sm font-medium' htmlFor='contexte'>
            Contexte <span className='text-muted-foreground font-normal'>(optionnel)</span>
          </label>
          <span className='text-xs text-muted-foreground'>{contexte.length}/500</span>
        </div>
        <Textarea
          id='contexte'
          value={contexte}
          onChange={(e) => setContexte(e.target.value.slice(0, 500))}
          placeholder='D&apos;où vient cette ref ? Qui l&apos;a lancée ? Quand ça a explosé ?'
          rows={3}
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <ul className='text-sm text-destructive list-disc list-inside space-y-1'>
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className='flex gap-3'>
        <Button variant='ghost' onClick={onBack} className='flex-1'>
          ← Retour
        </Button>
        <Button onClick={handleNext} className='flex-1'>
          Suivant →
        </Button>
      </div>
    </div>
  )
}
