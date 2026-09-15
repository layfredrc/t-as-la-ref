const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7

/**
 * Date relative courte en français : « à l'instant », « 4 min », « 3 j »…
 * Au-delà d'un mois on bascule sur une date absolue.
 */
export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const seconds = Math.floor((Date.now() - then) / 1000)

  if (seconds < 0) return "à l'instant"
  if (seconds < MINUTE) return "à l'instant"
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} min`
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)} h`
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)} j`
  if (seconds < DAY * 30) return `${Math.floor(seconds / WEEK)} sem`

  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
