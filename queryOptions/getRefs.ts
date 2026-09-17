import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { Ref, Tag } from '@/lib/types'

/**
 * Le feed a besoin d'au moins une ref d'avance pour que le swipe ait une
 * destination. À 1, Swiper n'avait qu'une seule slide : nulle part où aller,
 * donc aucun changement de slide — et le préchargement, déclenché par ce
 * changement, n'arrivait jamais. Le feed restait bloqué sur la première ref.
 */
const PAGE_SIZE = 5

type RefsPage = {
  data: Ref[]
  nextPage: number | undefined
}

export const useInfiniteRefs = () => {
  return useInfiniteQuery<RefsPage>({
    queryKey: ['refs'],
    queryFn: async ({ pageParam }) => {
      const supabase = createClient()
      const page = (pageParam as number) ?? 0

      const { data, error } = await supabase
        .from('refs')
        .select(
          `
          id, slug, titre, media_url, media_type, contexte, score_culture,
          likes_count, comments_count, drole_score, importance_score, votes_count, created_at, auteur_id,
          refs_tags ( tags ( id, label, emoji, type, slug ) )
        `,
        )
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) throw error

      const refs: Ref[] = (data ?? []).map((row) => {
        const tags: Tag[] = (row.refs_tags ?? []).flatMap((rt: { tags: unknown }) => {
          const tag = rt.tags as Tag | Tag[] | null
          if (!tag) return []
          return Array.isArray(tag) ? tag : [tag]
        })
        const { refs_tags: _, ...rest } = row
        return { ...rest, tags } as Ref
      })

      return {
        data: refs,
        nextPage: refs.length === PAGE_SIZE ? page + 1 : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  })
}
