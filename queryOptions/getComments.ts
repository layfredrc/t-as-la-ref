import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CommentThread, RefComment } from '@/lib/types'

export const commentsKey = (refId: string) => ['comments', refId] as const

/**
 * Regroupe la liste plate renvoyée par l'API en racines + réponses.
 *
 * Le thread n'a qu'un niveau visuel, mais rien n'empêche de poster une réponse
 * à une réponse : le trigger serveur ne vérifie que l'appartenance à la même
 * ref. On remonte donc chaque commentaire jusqu'à sa racine plutôt que de
 * n'accepter que `parent_id` direct — sinon ces réponses disparaissent de
 * l'affichage tout en restant comptées dans `comments_count`.
 */
function toThreads(comments: RefComment[]): CommentThread[] {
  const byId = new Map(comments.map((c) => [c.id, c]))

  const rootIdOf = (comment: RefComment): string => {
    const seen = new Set<string>([comment.id])
    let current = comment

    while (current.parent_id) {
      const parent = byId.get(current.parent_id)
      // Parent absent (supprimé, non chargé) ou cycle : on s'arrête là.
      if (!parent || seen.has(parent.id)) break
      seen.add(parent.id)
      current = parent
    }

    return current.id
  }

  const roots = comments.filter((c) => !c.parent_id)
  const repliesByRoot = new Map<string, RefComment[]>()

  for (const comment of comments) {
    if (!comment.parent_id) continue
    const rootId = rootIdOf(comment)
    if (rootId === comment.id) continue // orpheline : sa racine a disparu
    const bucket = repliesByRoot.get(rootId) ?? []
    bucket.push(comment)
    repliesByRoot.set(rootId, bucket)
  }

  return roots.map((root) => ({
    ...root,
    replies: (repliesByRoot.get(root.id) ?? []).sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    ),
  }))
}

export const useComments = (refId: string) => {
  return useQuery({
    queryKey: commentsKey(refId),
    queryFn: async (): Promise<CommentThread[]> => {
      const res = await fetch(`/api/comments?ref_id=${refId}`)
      const json = await res.json()

      if (!res.ok) throw new Error(json?.error ?? 'Erreur lors du chargement.')
      return toThreads((json.comments ?? []) as RefComment[])
    },
  })
}

type AddCommentInput = { content: string; parentId?: string | null }

export const useAddComment = (refId: string) => {
  const queryClient = useQueryClient()

  return useMutation<RefComment, Error, AddCommentInput>({
    mutationFn: async ({ content, parentId }) => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref_id: refId, content, parent_id: parentId ?? null }),
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json?.error ?? "Erreur lors de l'envoi.")
      return json.comment as RefComment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(refId) })
    },
  })
}

export const useDeleteComment = (refId: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (commentId) => {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Erreur lors de la suppression.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(refId) })
    },
  })
}
