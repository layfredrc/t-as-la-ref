import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { LikeState } from '@/lib/types'
import { refsQueryKey, type RefsPage } from '@/lib/refs/fetchRefsPage'
import type { InfiniteData } from '@tanstack/react-query'

export const myLikesKey = ['my-likes'] as const

/**
 * Ids des refs likées par l'utilisateur courant.
 * Une seule requête pour tout le feed — évite un aller-retour par carte.
 */
export const useMyLikes = () => {
  return useQuery({
    queryKey: myLikesKey,
    queryFn: async (): Promise<string[]> => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase.from('likes').select('ref_id').eq('user_id', user.id)

      if (error) throw error
      return (data ?? []).map((row) => row.ref_id as string)
    },
    staleTime: 1000 * 60,
  })
}

export const useToggleLike = () => {
  const queryClient = useQueryClient()

  return useMutation<LikeState, Error, string, { previous: string[] | undefined }>({
    mutationFn: async (refId) => {
      const res = await fetch(`/api/refs/${refId}/like`, { method: 'POST' })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error ?? 'Erreur lors du like.')
      }
      return json as LikeState
    },

    // Optimiste : on bascule l'id dans la liste locale avant la réponse serveur.
    onMutate: async (refId) => {
      await queryClient.cancelQueries({ queryKey: myLikesKey })
      const previous = queryClient.getQueryData<string[]>(myLikesKey)

      queryClient.setQueryData<string[]>(myLikesKey, (old) => {
        const current = old ?? []
        return current.includes(refId) ? current.filter((id) => id !== refId) : [...current, refId]
      })

      return { previous }
    },

    onError: (_error, _refId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(myLikesKey, context.previous)
      }
    },

    // Le serveur fait foi : on recale la liste sur sa réponse.
    onSuccess: (data, refId) => {
      queryClient.setQueryData<string[]>(myLikesKey, (old) => {
        const current = (old ?? []).filter((id) => id !== refId)
        return data.liked ? [...current, refId] : current
      })

      // Le compteur du feed aussi : une carte qui se remonte (le feed ne
      // rend que les slides voisines) repart de `likes_count` en cache —
      // sans ça elle réaffichait l'ancien nombre avec le cœur plein.
      queryClient.setQueryData<InfiniteData<RefsPage>>(refsQueryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((ref) =>
              ref.id === refId ? { ...ref, likes_count: data.likes_count } : ref,
            ),
          })),
        }
      })
    },
  })
}
