import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CommentThread, RefComment } from '@/lib/types'

export const commentsKey = (refId: string) => ['comments', refId] as const

/** Regroupe la liste plate renvoyée par l'API en racines + réponses directes. */
function toThreads(comments: RefComment[]): CommentThread[] {
  const roots = comments.filter((c) => !c.parent_id)
  const repliesByParent = new Map<string, RefComment[]>()

  for (const comment of comments) {
    if (!comment.parent_id) continue
    const bucket = repliesByParent.get(comment.parent_id) ?? []
    bucket.push(comment)
    repliesByParent.set(comment.parent_id, bucket)
  }

  return roots.map((root) => ({ ...root, replies: repliesByParent.get(root.id) ?? [] }))
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
