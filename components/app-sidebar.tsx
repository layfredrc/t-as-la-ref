'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { BookOpen, CirclePlus, LifeBuoy, Search, Send, TrendingUp, Trophy } from 'lucide-react'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogTrigger } from './ui/dialog'
import { LoginForm } from './login-form'
import { Input } from './ui/input'

const staticData = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Ajouter une ref',
      url: '#',
      icon: CirclePlus,
      isActive: true,
    },
    {
      title: 'En ce moment',
      url: '#',
      icon: TrendingUp,
    },
    {
      title: 'Découvrir',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Meme',
          url: '#',
        },
        {
          title: 'Slang',
          url: '#',
        },
        {
          title: 'Drip',
          url: '#',
        },
        {
          title: 'Spot',
          url: '#',
        },
      ],
    },
    {
      title: 'Ranking',
      url: '#',
      icon: Trophy,
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
}

type Profile = {
  username?: string
  profile_picture?: string
  email?: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const fetchProfile = async () => {
      setLoadingProfile(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user || !user.id) {
          setProfile(null)
          return
        }

        const { data, error } = await supabase
          .from('users')
          .select('username, profile_picture, email')
          .eq('id', user.id)
          .single()

        if (error) {
          // If the row doesn't exist or RLS blocks it, just keep null profile
          console.debug('supabase fetch profile error', error)
          if (mounted) setProfile(null)
        } else if (mounted) {
          setProfile(data || null)
        }
      } catch (err) {
        console.error('failed to fetch profile', err)
      } finally {
        if (mounted) setLoadingProfile(false)
      }
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [])

  // build the user object to pass to NavUser: prefer profile data, fall back to staticData
  const userForNav = {
    name: profile?.username || staticData.user.name,
    email: profile?.email,
    avatar: profile?.profile_picture || staticData.user.avatar,
  }

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#'>
                <div
                  className='
            flex items-center justify-center
            w-[88px] h-[40px]
            bg-white border-2 border-black
            rounded-[8px]
            shadow-[-4px_4px_0_#000]
          '
                >
                  <Image
                    src='/logo.png'
                    alt='logo'
                    width={42}
                    height={42}
                    className='rounded-xl'
                    priority
                  />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className='relative mt-4'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input type='text' placeholder='Trouver une ref' className='pl-9 bg-white' />
        </div>
        {!profile && (
          <div className='relative mt-4'>
            <Dialog>
              <DialogTrigger
                asChild
                className='ml-4 bg-accent5 px-4 py-2 order-2 border-black rounded-[8px]
            shadow-[-4px_4px_0_#000] w-[60%] cursor-pointer hover:translate-y-1  transition-all ease-in delay-100'
              >
                <div className='font-supplymono text-fg text-center'>Connexion</div>
              </DialogTrigger>
              <LoginForm />
            </Dialog>
          </div>
        )}
        <NavMain items={staticData.navMain} />
        <NavSecondary items={staticData.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        {loadingProfile && (
          <div className='p-4'>
            <Skeleton className='h-10 w-full rounded-xl' />
          </div>
        )}
        {profile && <NavUser user={userForNav} />}
      </SidebarFooter>
    </Sidebar>
  )
}
