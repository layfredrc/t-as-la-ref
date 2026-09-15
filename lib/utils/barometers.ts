export type BarometerScore = 1 | 2 | 3 | 4 | 5

export const BAROMETER_MIN = 1
export const BAROMETER_MAX = 5
export const BAROMETER_DEFAULT: BarometerScore = 3

/** Ramène n'importe quelle valeur venue de la DB dans l'échelle 1–5. */
export function clampScore(value: number | null | undefined): BarometerScore {
  if (typeof value !== 'number' || Number.isNaN(value)) return BAROMETER_DEFAULT
  const rounded = Math.round(value)
  if (rounded < BAROMETER_MIN) return BAROMETER_MIN
  if (rounded > BAROMETER_MAX) return BAROMETER_MAX
  return rounded as BarometerScore
}

// ─── Baromètre « drôle » ──────────────────────────────────────────────────────

export const droleScale: Record<BarometerScore, { emoji: string; label: string }> = {
  1: { emoji: '😐', label: 'Bof' },
  2: { emoji: '😄', label: 'Ça sourit' },
  3: { emoji: '😂', label: 'Ça rigole' },
  4: { emoji: '🤣', label: 'Plié' },
  5: { emoji: '💀', label: 'Mort' },
}

// ─── Baromètre « importance culturelle » ──────────────────────────────────────

type ImportanceStep = {
  label: string
  /** Classes du badge — tokens du design system, jamais de hex en dur. */
  className: string
}

export const importanceScale: Record<BarometerScore, ImportanceStep> = {
  1: { label: 'Anecdotique', className: 'bg-[var(--bg2)] text-[var(--fg)]/70' },
  2: { label: 'Sympa', className: 'bg-[var(--neon-ocean)] text-white' },
  3: { label: 'Notable', className: 'bg-[var(--neon)] text-white' },
  4: { label: 'Culte', className: 'bg-[var(--accent2)] text-[var(--fg)]' },
  5: { label: 'Légendaire', className: 'badge-legendaire text-white' },
}
