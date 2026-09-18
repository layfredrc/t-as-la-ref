import type { SupabaseClient } from '@supabase/supabase-js'
import type { Ref, Tag } from '@/lib/types'

/**
 * Le feed a besoin d'au moins une ref d'avance pour que le swipe ait une
 * destination. À 1, Swiper n'avait qu'une seule slide : nulle part où aller,
 * donc aucun changement de slide — et le préchargement, déclenché par ce
 * changement, n'arrivait jamais. Le feed restait bloqué sur la première ref.
 */
export const PAGE_SIZE = 5

export const refsQueryKey = ['refs'] as const

export type RefsPage = {
  data: Ref[]
  nextPage: number | undefined
}

const REF_SELECT = `
  id, slug, titre, media_url, media_type, contexte, score_culture,
  likes_count, comments_count, drole_score, importance_score, votes_count, created_at, auteur_id,
  refs_tags ( tags ( id, label, emoji, type, slug ) )
`

type RefRow = Omit<Ref, 'tags' | 'thumbnail' | 'status'> & {
  refs_tags: { tags: Tag | Tag[] | null }[] | null
}

/**
 * Une page du feed. Partagée entre le serveur (première page rendue avec la
 * route, pas de « Chargement des refs… » à l'arrivée) et le client (pages
 * suivantes au fil des swipes) : une seule requête, une seule mise en forme.
 */
export async function fetchRefsPage(supabase: SupabaseClient, page: number): Promise<RefsPage> {
  const { data, error } = await supabase
    .from('refs')
    .select(REF_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (error) throw error

  const rows = (data ?? []) as unknown as RefRow[]
  const refs: Ref[] = rows.map(({ refs_tags, ...rest }) => {
    const tags: Tag[] = (refs_tags ?? []).flatMap((rt) => {
      if (!rt.tags) return []
      return Array.isArray(rt.tags) ? rt.tags : [rt.tags]
    })
    return { ...rest, status: 'published', thumbnail: null, tags }
  })

  return {
    data: refs,
    nextPage: refs.length === PAGE_SIZE ? page + 1 : undefined,
  }
}
