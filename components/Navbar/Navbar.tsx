'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className='fixed inset-x-0 top-0 z-[10000] pointer-events-auto'>
      <div className='w-[100vw] p-6 z-10'>
        <div className='flex flex-row justify-between items-center'>
          {/* Badge Figma-style */}
          <div
            className='
            flex items-center justify-center
            w-[128px] h-[68px]
            bg-white border-4 border-black
            rounded-[13px]
            shadow-[-8px_8px_0_#000]
          '
          >
            <Link href='/'>
              <Image
                src='/logo.png'
                alt='logo'
                width={69}
                height={69}
                className='rounded-xl'
                priority
              />
            </Link>
          </div>
          <ul className='flex flex-row items-center gap-5 z-10'>
            <Link
              href='/feed'
              className='mr-2 bg-fg text-white border-1 px-4 py-2 rounded-lg border-black'
            >
              <li className='font-supplymono  text-white'>Explorer les refs</li>
            </Link>
            <Link
              href='/login'
              className='bg-accent5 px-4 py-2 border-1 rounded-lg  hover:translate-y-1  transition-all ease-in delay-100'
            >
              <li className='font-supplymono uppercase'>LOGIN</li>
            </Link>
          </ul>
        </div>
      </div>
    </nav>
  )
}
