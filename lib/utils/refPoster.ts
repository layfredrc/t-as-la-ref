import type { MediaType } from '@/lib/types'

/**
 * Tout ce qui concerne l'affiche d'une ref : d'où vient l'image, dans quel
 * ordre on tente les URL, et à quoi ressemble la carte quand il n'y en a
 * aucune.
 *
 * Le feed poster-first ne monte plus d'iframe pendant la navigation : la
 * vignette est donc le seul visuel de la ref, et elle doit exister *toujours*.
 * D'où trois sources, de la moins chère à la plus chère :
 *
 *  1. `refs.thumbnail` en base — rien à faire, mais la colonne est vide
 *     aujourd'hui sur toutes les refs ;
 *  2. une URL déductible de l'URL du média (YouTube en publie une par vidéo à
 *     une adresse prévisible) — gratuit, immédiat, aucun aller-retour ;
 *  3. l'oEmbed de la plateforme (TikTok) — un appel réseau, mutualisé pour
 *     tout le feed par `/api/refs/thumbnails`.
 *
 * Et quand les trois échouent, un rendu typographique qui reste une affiche
 * (voir `posterTheme`), jamais un carré gris.
 */

/**
 * Ordre de repli des vignettes YouTube.
 *
 * `maxresdefault` n'est généré que pour les vidéos publiées au-dessus de 720p.
 * Pour les autres, l'adresse répond 404 — d'où le repli sur `hqdefault`, que
 * YouTube produit pour absolument toutes les vidéos. Le repli se joue dans le
 * navigateur, sur l'événement `error` de l'image : c'est le seul moyen de
 * savoir laquelle des deux existe sans requête préalable.
 */
const YOUTUBE_THUMBNAIL_SIZES = ['maxresdefault', 'hqdefault'] as const

/**
 * Couvre les quatre formes d'URL YouTube qu'on rencontre en base — `watch`,
 * `youtu.be`, `shorts` et `embed`. Les Shorts comptent : `detectMediaType` les
 * reconnaît déjà comme `youtube`, et ce sont eux que les gens collent le plus.
 */
const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/

export function extractYoutubeId(url: string): string | null {
  return url.match(YOUTUBE_ID_PATTERN)?.[1] ?? null
}

/**
 * Vignettes déductibles de la seule URL du média — aucun réseau, donc
 * disponibles dès le premier rendu de la carte.
 */
export function predictableThumbnails(url: string, mediaType: MediaType): string[] {
  if (mediaType !== 'youtube') return []
  const id = extractYoutubeId(url)
  if (!id) return []
  return YOUTUBE_THUMBNAIL_SIZES.map((size) => `https://img.youtube.com/vi/${id}/${size}.jpg`)
}

/**
 * Plateformes dont la vignette ne s'obtient que par oEmbed.
 *
 * TikTok seulement pour l'instant : son endpoint oEmbed est public et rend un
 * `thumbnail_url` exploitable. Instagram et Facebook passent par l'API Graph,
 * qui réclame un jeton applicatif (voir `/api/meta-oembed`) — tant qu'il n'est
 * pas configuré, ces refs tombent sur l'affiche typographique, ce qui est un
 * repli acceptable. Twitter/X ne renvoie pas d'image du tout.
 */
export function needsOembedThumbnail(mediaType: MediaType): boolean {
  return mediaType === 'tiktok'
}

/**
 * Liste ordonnée des adresses à tenter pour une ref, de la plus fiable à la
 * plus incertaine. Le composant descend la liste à chaque `error` d'image.
 */
export function thumbnailCandidates(
  ref: { media_url: string; media_type: MediaType; thumbnail: string | null },
  oembedThumbnail?: string | null,
): string[] {
  const candidates = [
    ref.thumbnail,
    ...predictableThumbnails(ref.media_url, ref.media_type),
    oembedThumbnail,
  ]

  // `filter(Boolean)` ne suffirait pas à TypeScript pour éliminer `null`.
  return candidates.filter((url): url is string => Boolean(url))
}

// ─── Affiche de repli ─────────────────────────────────────────────────────────

export type PosterTheme = {
  /** Fond de l'affiche — toujours un token du design system. */
  surface: string
  /** Encre du titre et du filigrane, choisie pour contraster avec `surface`. */
  ink: string
  /** Teinte du filigrane « ? », plus discrète que l'encre. */
  watermark: string
}

/**
 * Une ref sans vignette reste une affiche : aplat de couleur, rayures, et le
 * grand « ? » de la marque en filigrane. Quatre déclinaisons pour que deux
 * refs voisines dans le feed ne se ressemblent jamais.
 */
const POSTER_THEMES: PosterTheme[] = [
  {
    surface: 'bg-[var(--accent5)]',
    ink: 'text-[var(--fg)]',
    watermark: 'text-[var(--fg)]/15',
  },
  {
    // Surtout pas `accent1` ici : c'est la couleur du bouton de lecture, qui
    // disparaissait dans l'affiche. Vérifié au navigateur.
    surface: 'bg-[var(--accent2)]',
    ink: 'text-[var(--fg)]',
    watermark: 'text-[var(--fg)]/15',
  },
  {
    surface: 'bg-[var(--accent3)]',
    ink: 'text-[var(--fg)]',
    watermark: 'text-[var(--fg)]/15',
  },
  {
    surface: 'bg-[var(--accent4)]',
    ink: 'text-[var(--accent2)]',
    watermark: 'text-[var(--accent2)]/20',
  },
]

/**
 * Thème stable pour une ref donnée : la même ref garde son affiche d'un
 * chargement à l'autre, et d'un appareil à l'autre. Un index aléatoire ferait
 * clignoter la carte à chaque re-rendu.
 */
export function posterTheme(seed: string): PosterTheme {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return POSTER_THEMES[Math.abs(hash) % POSTER_THEMES.length]
}
