import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const { data, error } = await supabase
        .from('users')
        .select('username, profile_picture, email')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
  })
}
