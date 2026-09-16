import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BarometerVote, BarometerVoteState } from '@/lib/types'

/**
 * Pose ou met à jour le vote de l'utilisateur sur les baromètres d'une ref.
 * La route est un upsert : revoter écrase le vote précédent.
 */
export const useVoteBarometre = (refId: string) => {
  const queryClient = useQueryClient()

  return useMutation<BarometerVoteState, Error, BarometerVote>({
    mutationFn: async (vote) => {
      const res = await fetch(`/api/refs/${refId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vote),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error ?? 'Erreur lors du vote.')
      }
      return json as BarometerVoteState
    },

    // Le feed affiche les mêmes moyennes : il doit repartir de la base.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refs'] })
    },
  })
}
