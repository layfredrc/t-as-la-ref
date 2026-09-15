'use client'

import { useId, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import {
  BAROMETER_MAX,
  BAROMETER_MIN,
  type BarometerScore,
  clampScore,
  droleScale,
  importanceScale,
} from '@/lib/utils/barometers'

type BarometerProps = {
  value: BarometerScore
  onChange: (value: BarometerScore) => void
}

/** Socle commun : label, rendu de la valeur, range natif, graduations. */
function BarometerShell({
  label,
  hint,
  readout,
  value,
  onChange,
  ariaValueText,
}: {
  label: string
  hint: string
  readout: React.ReactNode
  value: BarometerScore
  onChange: (value: BarometerScore) => void
  ariaValueText: string
}) {
  const id = useId()
  const readoutRef = useRef<HTMLDivElement>(null)

  // Rebond à chaque cran. `gsap.matchMedia` coupe tout si le système
  // demande moins de mouvement — la valeur reste lisible, elle ne bouge plus.
  useGSAP(
    () => {
      const target = readoutRef.current?.firstElementChild
      if (!target) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          target,
          { scale: 0.55, rotate: -10 },
          { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(3)' },
        )
      })
      return () => mm.revert()
    },
    { dependencies: [value], scope: readoutRef },
  )

  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={id} className='font-supplymono text-sm text-[var(--fg)]'>
        {label}
      </label>

      <div className='flex items-center gap-4 rounded-lg border-2 border-black bg-[var(--bg)] p-4'>
        <div ref={readoutRef} className='flex w-24 shrink-0 justify-center'>
          {readout}
        </div>

        <div className='flex flex-1 flex-col'>
          <input
            id={id}
            type='range'
            min={BAROMETER_MIN}
            max={BAROMETER_MAX}
            step={1}
            value={value}
            onChange={(e) => onChange(clampScore(Number(e.target.value)))}
            aria-valuetext={ariaValueText}
            className='barometer-range'
          />
          <div
            aria-hidden
            className='flex justify-between px-1 font-supplymono text-[10px] text-[var(--fg)]/40'
          >
            {[1, 2, 3, 4, 5].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </div>

      <p className='font-supplymono text-xs text-[var(--fg)]/50'>{hint}</p>
    </div>
  )
}

export function DroleBarometer({ value, onChange }: BarometerProps) {
  const step = droleScale[value]

  return (
    <BarometerShell
      label="C'est drôle ?"
      hint='Glisse, ou utilise les flèches du clavier.'
      value={value}
      onChange={onChange}
      ariaValueText={`${value} sur 5 — ${step.label}`}
      readout={
        <div className='flex flex-col items-center gap-1'>
          {/* L'emoji est ici la valeur affichée, pas une icône décorative :
              il porte l'information au même titre que le libellé sous lui. */}
          <span key={value} className='text-4xl' role='img' aria-label={step.label}>
            {step.emoji}
          </span>
          <span className='font-supplymono text-[10px] text-[var(--fg)]/60'>{step.label}</span>
        </div>
      }
    />
  )
}

export function ImportanceBarometer({ value, onChange }: BarometerProps) {
  const step = importanceScale[value]

  return (
    <BarometerShell
      label="C'est important dans la culture ?"
      hint='De la blague oubliée demain au monument du web FR.'
      value={value}
      onChange={onChange}
      ariaValueText={`${value} sur 5 — ${step.label}`}
      readout={
        <span
          key={value}
          className={cn(
            'rounded-full border-2 border-black px-2.5 py-1 text-center font-supplymono text-[11px]',
            step.className,
          )}
        >
          {step.label}
        </span>
      }
    />
  )
}

// ─── Variante lecture seule (feed + page détail) ──────────────────────────────

type BarometerReadoutProps = {
  drole: number | null | undefined
  importance: number | null | undefined
  className?: string
}

export function BarometerReadout({ drole, importance, className }: BarometerReadoutProps) {
  const droleValue = clampScore(drole)
  const importanceValue = clampScore(importance)
  const droleStep = droleScale[droleValue]
  const importanceStep = importanceScale[importanceValue]

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span
        className='flex items-center gap-1 rounded-full border-2 border-black bg-[var(--bg)] px-2 py-0.5 font-supplymono text-[11px] text-[var(--fg)]'
        title={`Drôle : ${droleValue}/5 — ${droleStep.label}`}
      >
        <span role='img' aria-label={droleStep.label}>
          {droleStep.emoji}
        </span>
        <span className='tabular-nums'>{droleValue}/5</span>
      </span>

      <span
        className={cn(
          'rounded-full border-2 border-black px-2 py-0.5 font-supplymono text-[11px]',
          importanceStep.className,
        )}
        title={`Importance culturelle : ${importanceValue}/5`}
      >
        {importanceStep.label}
      </span>
    </div>
  )
}
