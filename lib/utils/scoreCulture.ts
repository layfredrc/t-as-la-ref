import type { Ref } from '@/lib/types'

/**
 * Libellés du score culture.
 *
 * Ils étaient déclarés dans `RefCard`. Sortis ici pour que le feed
 * poster-first les réutilise sans importer la carte vidéo — et donc sans
 * embarquer `react-player` et ses web components dans son bundle.
 */
export const scoreCultureLabels: Record<Ref['score_culture'], string> = {
  inconnu: 'Inconnu 🤷',
  'gen-z': 'Only Gen Z ⚡',
  cultissime: 'Cultissime 🏆',
}

export function scoreCultureLabel(score: string): string {
  return scoreCultureLabels[score as Ref['score_culture']] ?? score
}
