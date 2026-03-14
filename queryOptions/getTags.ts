import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { Tag, TagsByType } from '@/lib/types'

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<TagsByType> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tags')
        .select('id, label, type, emoji, slug')
        .order('label')

      if (error) throw error

      const tags = (data ?? []) as Tag[]

      return {
        type_ref: tags.filter((t) => t.type === 'type_ref'),
        origine: tags.filter((t) => t.type === 'origine'),
        vibe: tags.filter((t) => t.type === 'vibe'),
      }
    },
    staleTime: 1000 * 60 * 10, // tags rarely change — cache 10 min
  })
}
