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
            className='flex justify-between px-1 font-supplymono text-[10px] text-[var(--fg)]/70'
          >
            {[1, 2, 3, 4, 5].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </div>

      <p className='font-supplymono text-xs text-[var(--fg)]/70'>{hint}</p>
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
          <span className='font-supplymono text-[10px] text-[var(--fg)]/70'>{step.label}</span>
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

/**
 * Jauge à 5 crans. Le baromètre du flow d'ajout se lit d'un coup d'œil parce
 * qu'il a une piste graduée : la version lecture seule doit garder ce signal,
 * sinon la note se réduit à une pastille qu'on ne repère plus dans la carte.
 */
function Track({ value, fill, size }: { value: BarometerScore; fill: string; size: Size }) {
  return (
    <span aria-hidden className='flex gap-[3px]'>
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={cn(
            'rounded-[2px] border border-black/80 transition-colors',
            size === 'full' ? 'h-2.5 w-5' : 'h-2 w-3.5',
            step <= value ? fill : 'bg-[var(--bg)]',
          )}
        />
      ))}
    </span>
  )
}

type Size = 'compact' | 'full'

function Gauge({
  label,
  emoji,
  stepLabel,
  value,
  fill,
  size,
  badgeClassName,
}: {
  label: string
  emoji: string
  stepLabel: string
  value: BarometerScore
  fill: string
  size: Size
  /** Palier « importance » : le badge porte sa propre couleur de niveau. */
  badgeClassName?: string
}) {
  return (
    <div
      className='flex flex-col gap-1'
      role='img'
      aria-label={`${label} ${value} sur 5 — ${stepLabel}`}
    >
      {size === 'full' && (
        <span className='font-supplymono text-xs text-[var(--fg)]/70'>{label}</span>
      )}

      <div className='flex items-center gap-2'>
        <span aria-hidden className={size === 'full' ? 'text-2xl' : 'text-lg'}>
          {emoji}
        </span>
        <Track value={value} fill={fill} size={size} />
        <span
          className={cn(
            'rounded-full border-2 border-black px-2 py-0.5 font-supplymono leading-none',
            size === 'full' ? 'text-[11px]' : 'text-[10px]',
            badgeClassName ?? 'bg-[var(--bg)] text-[var(--fg)]',
          )}
        >
          {stepLabel}
        </span>
      </div>
    </div>
  )
}

type BarometerReadoutProps = {
  drole: number | null | undefined
  importance: number | null | undefined
  /** `full` sur la page détail, `compact` dans le panneau du feed. */
  variant?: Size
  /** Nombre de votes derrière la moyenne — masqué si absent. */
  votesCount?: number
  className?: string
}

export function BarometerReadout({
  drole,
  importance,
  variant = 'compact',
  votesCount,
  className,
}: BarometerReadoutProps) {
  const droleValue = clampScore(drole)
  const importanceValue = clampScore(importance)
  const droleStep = droleScale[droleValue]
  const importanceStep = importanceScale[importanceValue]

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border-2 border-black bg-[var(--bg)] p-3',
        variant === 'full' ? 'gap-4 p-4' : 'gap-2.5',
        className,
      )}
    >
      <span className='font-supplymono text-[10px] uppercase tracking-wider text-[var(--fg)]/60'>
        Le baromètre
        {typeof votesCount === 'number' && (
          <span className='normal-case tracking-normal'>
            {' · '}
            {votesCount === 0
              ? 'aucun vote'
              : `${votesCount} vote${votesCount > 1 ? 's' : ''}`}
          </span>
        )}
      </span>

      <Gauge
        label="C'est drôle ?"
        emoji={droleStep.emoji}
        stepLabel={droleStep.label}
        value={droleValue}
        fill='bg-[var(--accent1)]'
        size={variant}
      />

      <Gauge
        label='Important dans la culture ?'
        emoji='🏛️'
        stepLabel={importanceStep.label}
        value={importanceValue}
        fill='bg-[var(--neon)]'
        size={variant}
        badgeClassName={importanceStep.className}
      />
    </div>
  )
}
