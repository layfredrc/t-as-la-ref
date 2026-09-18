import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { fetchRefsPage, refsQueryKey, type RefsPage } from '@/lib/refs/fetchRefsPage'

export const useInfiniteRefs = () => {
  return useInfiniteQuery<RefsPage>({
    queryKey: refsQueryKey,
    queryFn: ({ pageParam }) => fetchRefsPage(createClient(), (pageParam as number) ?? 0),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    // Le feed est un flux : on ne le remet pas en cause pendant qu'on le lit.
    // Les mutations (vote, like) invalident ce qu'elles touchent.
    staleTime: 5 * 60 * 1000,
  })
}
