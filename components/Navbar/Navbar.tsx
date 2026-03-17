'use client'

import { Dialog, DialogTrigger } from '../ui/dialog'
import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from '../login-form'
import { useUserProfile } from '@/queryOptions/getUserProfile'

export default function Navbar() {
  const { data: userProfile } = useUserProfile()

  return (
    <nav className='fixed inset-x-0 top-0 z-[10000] pointer-events-auto'>
      <div className='w-[100vw] p-3 sm:p-6 z-10'>
        <div className='flex flex-row justify-between items-center'>
          {/* Badge Figma-style */}
          <div className='flex items-center justify-center w-[100px] h-[64px] sm:w-[128px] sm:h-[68px] bg-white border-4 border-black rounded-[13px] shadow-[-5px_5px_0_#000] sm:shadow-[-8px_8px_0_#000]'>
            <Link href='/'>
              <Image
                src='/logo.png'
                alt='logo'
                width={69}
                height={69}
                className='rounded-xl w-[52px] h-[52px] sm:w-[69px] sm:h-[69px]'
                priority
              />
            </Link>
          </div>
          <ul className='flex flex-row items-center gap-2 sm:gap-5 z-10'>
            <Link
              href='/feed'
              className='bg-fg text-white border-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border-black'
            >
              <li className='font-supplymono text-white text-xs sm:text-sm'>Explorer les refs</li>
            </Link>
            {!userProfile && (
              <Dialog>
                <DialogTrigger
                  asChild
                  className='bg-accent5 px-3 py-1.5 sm:px-4 sm:py-2 border-1 rounded-lg hover:translate-y-1 transition-all ease-in delay-100'
                >
                  <li className='font-supplymono text-xs sm:text-sm'>Connexion</li>
                </DialogTrigger>
                <LoginForm />
              </Dialog>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
