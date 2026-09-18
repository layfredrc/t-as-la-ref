import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/server'
import { fetchRefsPage, refsQueryKey } from '@/lib/refs/fetchRefsPage'
import { Feed } from '@/components/ref/Feed'

/**
 * La première page de refs part avec le HTML.
 *
 * Avant, le feed était entièrement client : à l'arrivée, un écran
 * « Chargement des refs… », puis un aller-retour Supabase depuis le
 * navigateur, puis seulement la première vidéo. Ici la page 0 est lue côté
 * serveur et déshydratée dans le cache TanStack : `useInfiniteRefs` la trouve
 * déjà là et la première ref se monte au premier rendu.
 */
export default async function FeedPage() {
  const queryClient = new QueryClient()
  const supabase = await createClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: refsQueryKey,
    queryFn: () => fetchRefsPage(supabase, 0),
    initialPageParam: 0,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Feed />
    </HydrationBoundary>
  )
}
