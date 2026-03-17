import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='bg-background'>
        <MobileHeader />
        <div className='pt-16 md:pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
