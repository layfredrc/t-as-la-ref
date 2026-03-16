import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header
          className='flex h-16 shrink-0 items-center gap-2 px-4
             fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md
             md:hidden'
        >
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
