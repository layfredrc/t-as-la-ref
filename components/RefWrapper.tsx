import React from 'react'
// Replace with actual import path to your ShortsPlayer component
import {
  Heart,
  Share2,
  Bookmark,
  MessageCircle,
  ArrowRight,
  PlusCircleIcon,
  Lightbulb,
} from 'lucide-react'
import { VideoPlayer } from './VideoPlayer/VideoPlayer'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Question, QuestionIcon } from '@phosphor-icons/react'
import Image from 'next/image'

const RefWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative flex justify-center items-center w-full h-screen bg-white overflow-hidden'>
      {/* Ambient glass reflection */}
      <div className='absolute inset-0 backdrop-blur-xl bg-accent  pointer-events-none z-0' />
      <div className='absolute xl:top-6 2xl:top-23 left-12 flex flex-col space-y-8 w-[300px]'>
        <div className='border-2 rounded-lg border-black  bg-bg2 p-4 space-y-8'>
          <h1 className='text-4xl w-56 transform-none '>Je broie la langue de Molière 😂</h1>
          <div className='flex gap-3'>
            <h3 className='text-sm font-supplymono'>Score Culture 🔥 :</h3>{' '}
            <Badge variant='secondary'>Only Gen Z</Badge>
          </div>
          <div className='flex flex-row flex-wrap gap-2'>
            <Badge className='bg-accent1 text-fg'>#tiktok</Badge>
            <Badge className='bg-accent2 text-fg'>#snapchat</Badge>
            <Badge className='bg-fg text-white'>#X</Badge>
            <Badge className='bg-accent5 text-fg'>#instagram</Badge>
          </div>
          <div className='flex flex-row flex-wrap gap-2'>
            <Badge variant='default'>#frenchCore</Badge>
            <Badge variant='default'>#tonton</Badge>
          </div>

          <div className='flex justify-start'>
            <Button size='sm' className='rounded-lg'>
              <PlusCircleIcon />
              Enrichir la ref
            </Button>
          </div>
        </div>
      </div>

      {/* Centered Player */}
      {children}

      {/* Overlay buttons on the right of the player */}
      <div className='absolute xl:right-40 lg:right-40 md:right-40 bottom-5 2xl:bottom-22  z-20 flex flex-col gap-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-xl'>
        <div className='flex flex-col gap-2 items-center'>
          <button className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110'>
            <Heart className='w-6 h-6 text-white' />
          </button>
          <span className='text-white'>100</span>
        </div>
        <div className='flex flex-col gap-2 items-center'>
          <button className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110'>
            <MessageCircle className='w-6 h-6 text-white' />
          </button>
          <span className='text-white'>10</span>
        </div>
        <div className='flex flex-col gap-2 items-center'>
          <button className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110'>
            <Image
              src='/logo-white.png'
              alt='logo'
              width={42}
              height={42}
              className='rounded-xl'
              priority
            />
          </button>
          <span className='text-white'>Découvrir</span>
        </div>
      </div>
    </div>
  )
}

export default RefWrapper
