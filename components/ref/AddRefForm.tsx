'use client'

import { Fragment, useState } from 'react'
import { StepMedia } from './steps/StepMedia'
import { StepRef } from './steps/StepRef'
import { StepDerives } from './steps/StepDerives'
import { StepPreview } from './steps/StepPreview'
import type { AddRefFormData } from '@/lib/types'
import { cn } from '@/lib/utils'

const INITIAL_FORM_DATA: AddRefFormData = {
  mediaSource: null,
  media_url: '',
  media_type: null,
  titre: '',
  contexte: '',
  tag_type_ref: null,
  tag_origine: null,
  tag_vibe: null,
  derives: [],
  hashtags: [],
}

const STEPS = ['Média', 'La ref', 'Dérivés', 'Aperçu']

export function AddRefForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<AddRefFormData>(INITIAL_FORM_DATA)

  const patch = (data: Partial<AddRefFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const goNext = (data: Partial<AddRefFormData>) => {
    patch(data)
    setStep((s) => s + 1)
  }

  const goBack = () => setStep((s) => s - 1)

  return (
    <div
      className={`w-full mx-auto flex flex-col gap-8 ${step === 2 ? 'max-w-xl lg:max-w-4xl' : 'max-w-xl'}`}
    >
      {/* Step indicator */}
      <div className='flex items-start gap-1'>
        {STEPS.map((label, index) => {
          const stepNum = index + 1
          const isActive = stepNum === step
          const isCompleted = stepNum < step
          return (
            <Fragment key={label}>
              {/* Mobile : circle + label en colonne / Desktop : circle + label en ligne */}
              <div className='flex flex-col items-center gap-1 sm:flex-row sm:gap-2'>
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors shrink-0',
                    isCompleted && 'bg-stepper text-white',
                    isActive && 'bg-stepper/20 border border-stepper text-stepper',
                    !isCompleted && !isActive && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span
                  className={cn(
                    'text-[10px] text-center sm:text-xs sm:text-left',
                    isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </div>
              {/* Connecteur centré sur le cercle (mt-3 = 12px = moitié de h-6) */}
              {index < STEPS.length - 1 && (
                <div className={cn('h-px w-4 shrink-0 mt-3', isCompleted ? 'bg-stepper' : 'bg-border')} />
              )}
            </Fragment>
          )
        })}
      </div>

      {/* Step content */}
      <div>
        {step === 1 && <StepMedia formData={formData} onNext={goNext} />}
        {step === 2 && <StepRef formData={formData} onNext={goNext} onBack={goBack} />}
        {step === 3 && <StepDerives formData={formData} onNext={goNext} onBack={goBack} />}
        {step === 4 && <StepPreview formData={formData} onBack={goBack} />}
      </div>
    </div>
  )
}
