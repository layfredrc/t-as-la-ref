'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function TanstackQueryClientProvider({ children }: { children: React.ReactNode }) {
  // On crée un seul QueryClient par instance React (préserve le cache)
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools React Query (désactivées par défaut au démarrage) */}
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  )
}
