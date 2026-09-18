import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { UserProfile } from '@/lib/types'

export const userProfileKey = ['user-profile'] as const

export const useUserProfile = () => {
  return useQuery({
    queryKey: userProfileKey,
    queryFn: async (): Promise<UserProfile | null> => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      // `maybeSingle` : l'absence de ligne dans `users` n'est pas une erreur
      // de requête (`.single()` levait PGRST116 et laissait la query en état
      // d'erreur), c'est « pas de profil ».
      const { data, error } = await supabase
        .from('users')
        .select('username, profile_picture, email')
        .eq('id', user.id)
        .maybeSingle()

      if (error) throw error
      return data
    },
    // Lu par la navbar, la sidebar, l'onboarding et les commentaires : une
    // seule requête pour tout ça, puis on garde le résultat 5 min.
    staleTime: 5 * 60 * 1000,
  })
}
