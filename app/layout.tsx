import type { Metadata, Viewport } from 'next'
import './globals.css'

import ClientLayout from '@/client-layout'
import { Toaster } from 'sonner'
import { TanstackQueryClientProvider } from '@/TanstackQueryClientProvider'

export const metadata: Metadata = {
  title: "T'as la ref ?",
  description: "L'application qui documente le chaos numérique",
}

export const viewport: Viewport = {
  themeColor: '#edf1e8',
  // `viewport-fit=cover` : les `svh`/`dvh` du feed et de la home tiennent
  // compte de l'encoche et de la barre du bas sur iPhone.
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='fr'>
      <head>
        {/* Les lecteurs du feed sont des iframes tierces : ouvrir la connexion
            avant la première ref épargne DNS + TLS au premier swipe. */}
        <link rel='preconnect' href='https://www.youtube.com' />
        <link rel='preconnect' href='https://i.ytimg.com' />
        <link rel='preconnect' href='https://www.tiktok.com' />
      </head>
      <body>
        <TanstackQueryClientProvider>
          <Toaster />
          <ClientLayout>{children}</ClientLayout>
        </TanstackQueryClientProvider>
      </body>
    </html>
  )
}
