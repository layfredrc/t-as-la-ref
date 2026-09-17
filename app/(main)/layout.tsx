import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainShell } from '@/components/layout/MainShell'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='bg-background'>
        {/* `MainShell` décide de l'en-tête mobile : le feed s'en passe et
            occupe tout l'écran (voir le composant). */}
        <MainShell>{children}</MainShell>
      </SidebarInset>
    </SidebarProvider>
  )
}
