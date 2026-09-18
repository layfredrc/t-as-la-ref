'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function TanstackQueryClientProvider({ children }: { children: React.ReactNode }) {
  // Un seul QueryClient par instance React (préserve le cache).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Sans staleTime, chaque navigation remontait les composants et
            // relançait toutes leurs requêtes (profil, likes, feed complet).
            // Une minute de fraîcheur suffit : les mutations invalident
            // explicitement ce qu'elles changent.
            staleTime: 60 * 1000,
            // Sur mobile, revenir d'une autre app refetchait tout le feed
            // (toutes les pages), d'où un re-rendu en plein visionnage.
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Exclues du bundle de prod par la lib ; fermées par défaut en dev. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
