import { useQuery } from '@tanstack/react-query'
import type { Ref } from '@/lib/types'
import { needsOembedThumbnail, thumbnailCandidates } from '@/lib/utils/refPoster'

/**
 * Vignettes manquantes du feed, récupérées en un seul appel.
 *
 * Seules les refs qui n'ont *rien* d'autre passent par ici : une vignette en
 * base ou une URL YouTube déductible se suffisent, et la carte les affiche
 * sans attendre le réseau. Ce qui reste (TikTok) part en lot vers
 * `/api/refs/thumbnails`.
 */
export const useRefThumbnails = (refs: Ref[]) => {
  const urls = refs
    .filter((ref) => thumbnailCandidates(ref).length === 0 && needsOembedThumbnail(ref.media_type))
    .map((ref) => ref.media_url)

  // Dédoublonné et trié : la clé de requête doit être stable d'un rendu à
  // l'autre, sinon chaque re-rendu du feed relancerait la requête.
  const wanted = [...new Set(urls)].sort()

  return useQuery({
    queryKey: ['ref-thumbnails', wanted],
    enabled: wanted.length > 0,
    // Une vignette ne change pas : inutile de repasser derrière.
    staleTime: Infinity,
    queryFn: async (): Promise<Record<string, string | null>> => {
      const response = await fetch('/api/refs/thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: wanted }),
      })
      if (!response.ok) throw new Error('Vignettes indisponibles.')

      const json: unknown = await response.json()
      const thumbnails = (json as { thumbnails?: Record<string, string | null> }).thumbnails
      return thumbnails ?? {}
    },
  })
}
