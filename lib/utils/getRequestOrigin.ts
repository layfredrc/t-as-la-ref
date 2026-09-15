import { headers } from 'next/headers'

/**
 * Origine réelle de la requête courante.
 *
 * Indispensable pour les redirections OAuth : se baser sur NODE_ENV renvoie
 * toujours l'URL de prod dès qu'on n'est pas en `development`, donc une preview
 * Vercel (qui tourne en NODE_ENV=production) renvoyait l'utilisateur sur le site
 * déployé au lieu de la preview.
 *
 * Ordre de résolution :
 *  1. `origin` — présent sur les POST (Server Actions), c'est le plus fiable
 *  2. `x-forwarded-host` / `x-forwarded-proto` — posés par Vercel, couvrent les
 *     navigations GET comme le retour du callback Supabase
 *  3. `host` — dev local derrière aucun proxy
 *  4. `NEXT_PUBLIC_SITE_URL` — dernier recours
 */
export async function getRequestOrigin(): Promise<string> {
  const headerList = await headers()

  const origin = headerList.get('origin')
  if (origin) return stripTrailingSlash(origin)

  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  if (host) {
    const proto = headerList.get('x-forwarded-proto') ?? defaultProtocolFor(host)
    return `${proto}://${host}`
  }

  return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
}

function defaultProtocolFor(host: string): string {
  return host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}
