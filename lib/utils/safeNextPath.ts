/**
 * Chemin de retour après connexion, tel que reçu de l'URL (`?next=`).
 *
 * Seul un chemin relatif à l'application est accepté : un `next` forgé en
 * `https://…` ou `//…` transformerait la connexion en redirection ouverte,
 * vers n'importe quel site, depuis notre domaine.
 */
export function safeNextPath(next: string | null | undefined, fallback = '/feed'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return fallback
  }
  return next
}
