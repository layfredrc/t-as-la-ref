import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Vignettes des refs dont l'URL d'image ne se déduit pas (voir
 * `lib/utils/refPoster.ts`).
 *
 * En lot, et pas une route par ref : le feed poster-first affiche une dizaine
 * de cartes d'un coup, et autant de requêtes sortantes retarderaient
 * l'affichage des premières. Un seul aller-retour, les appels aux plateformes
 * partent en parallèle côté serveur.
 */

const bodySchema = z.object({
  // Borne franche : le feed pagine par 5, et personne n'a besoin d'en demander
  // plus d'un coup. Ça évite aussi d'ouvrir un proxy de fetch arbitraire.
  urls: z.array(z.string().url()).max(30),
})

/** `null` = « demandé, pas trouvé » — distinct de « jamais demandé ». */
type ThumbnailMap = Record<string, string | null>

/**
 * Mémoire de process. Les vignettes d'une ref ne changent pas : les relire à
 * chaque montage du feed ferait payer l'aller-retour vers TikTok à chaque
 * visite. Le cache disparaît au redéploiement, ce qui est exactement la durée
 * de vie qu'on veut pour un prototype — pas de purge à écrire.
 */
const CACHE_TTL_MS = 1000 * 60 * 60 * 6
const cache = new Map<string, { value: string | null; expiresAt: number }>()

function readCache(url: string): { value: string | null } | undefined {
  const hit = cache.get(url)
  if (!hit) return undefined
  if (hit.expiresAt < Date.now()) {
    cache.delete(url)
    return undefined
  }
  return { value: hit.value }
}

const oembedSchema = z.object({ thumbnail_url: z.string().url().optional() })

/**
 * oEmbed TikTok — endpoint public, sans jeton. Toute erreur (réseau, vidéo
 * supprimée, compte privé, format inattendu) se résout en `null` : la carte a
 * une affiche de repli, elle n'a pas besoin qu'on la fasse échouer.
 */
async function fetchTiktokThumbnail(url: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      // Le cache est ici (voir `cache` ci-dessus), pas dans celui de `fetch` :
      // on veut une durée de vie explicite, partagée par toutes les requêtes.
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) return null

    const parsed = oembedSchema.safeParse(await response.json())
    return parsed.success ? (parsed.data.thumbnail_url ?? null) : null
  } catch {
    return null
  }
}

function isTiktok(url: string): boolean {
  return /tiktok\.com\//.test(url)
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Liste d’URL manquante ou invalide.' }, { status: 400 })
  }

  // Dédoublonnage : le même média peut apparaître deux fois dans une page.
  const urls = [...new Set(parsed.data.urls)]
  const thumbnails: ThumbnailMap = {}

  const pending = urls.filter((url) => {
    const cached = readCache(url)
    if (cached) {
      thumbnails[url] = cached.value
      return false
    }
    return true
  })

  const fetched = await Promise.all(
    pending.map(async (url) => {
      const value = isTiktok(url) ? await fetchTiktokThumbnail(url) : null
      return [url, value] as const
    }),
  )

  for (const [url, value] of fetched) {
    cache.set(url, { value, expiresAt: Date.now() + CACHE_TTL_MS })
    thumbnails[url] = value
  }

  return NextResponse.json({ thumbnails })
}
