import type { Metadata } from 'next'
import './globals.css'

import ClientLayout from '@/client-layout'
import { Toaster } from 'sonner'
import { TanstackQueryClientProvider } from '@/TanstackQueryClientProvider'

export const metadata: Metadata = {
  title: "T'as la ref ?",
  description: "L'application qui documente le chaos numérique",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='fr'>
      <body>
        <TanstackQueryClientProvider>
          <Toaster />
          <ClientLayout>{children}</ClientLayout>
        </TanstackQueryClientProvider>
      </body>
    </html>
  )
}
