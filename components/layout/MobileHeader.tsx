'use client'

import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

const ROUTE_TITLES: Record<string, string> = {
  '/feed': 'Explorer',
  '/add': 'Ajouter une ref',
}

function getTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.startsWith('/ref/')) return 'La ref'
  if (pathname.startsWith('/profil/')) return 'Profil'
  return "T'as la ref ?"
}

export function MobileHeader() {
  const pathname = usePathname()
  const title = getTitle(pathname)

  return (
    <header
      className='flex h-16 shrink-0 items-center gap-2 px-4
         fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md
         md:hidden'
    >
      <SidebarTrigger className='-ml-1' />
      <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' />
      <span className='font-pprader uppercase text-sm tracking-wide truncate'>{title}</span>
    </header>
  )
}
