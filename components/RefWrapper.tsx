'use client'

import { Heart, MessageCircle } from 'lucide-react'
import { PlusCircleIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { MediaEmbed } from './ref/MediaEmbed'
import type { Ref, Tag } from '@/lib/types'

const scoreCultureLabel: Record<string, string> = {
  inconnu: 'Inconnu 🤷',
  'gen-z': 'Only Gen Z ⚡',
  cultissime: 'Cultissime 🏆',
}

type RefWrapperProps = {
  ref_data: Ref
}

const RefWrapper = ({ ref_data }: RefWrapperProps) => {
  const tagTypeRef = ref_data.tags?.find((t: Tag) => t.type === 'type_ref')
  const tagOrigine = ref_data.tags?.find((t: Tag) => t.type === 'origine')
  const tagVibe = ref_data.tags?.find((t: Tag) => t.type === 'vibe')

  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsPlaying(entry.isIntersecting),
      { threshold: 0.8 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className='relative flex justify-center items-center w-full h-screen bg-white overflow-hidden snap-start snap-always'>
      {/* Ambient glass reflection */}
      <div className='absolute inset-0 backdrop-blur-xl bg-accent pointer-events-none z-0' />

      {/* Left info panel */}
      <div className='absolute xl:top-6 2xl:top-23 left-12 flex flex-col space-y-8 w-[300px] z-10'>
        <div className='border-2 rounded-lg border-black bg-bg2 p-4 space-y-8'>
          <h1 className='text-4xl w-56 transform-none font-rader uppercase leading-[0.95]'>
            {ref_data.titre}
          </h1>

          <div className='flex gap-3 items-center'>
            <h3 className='text-sm font-supplymono'>Score Culture 🔥 :</h3>
            <Badge variant='secondary'>
              {scoreCultureLabel[ref_data.score_culture] ?? ref_data.score_culture}
            </Badge>
          </div>

          <div className='flex flex-row flex-wrap gap-2'>
            {tagTypeRef && (
              <Badge className='bg-accent1 text-fg'>
                {tagTypeRef.emoji} {tagTypeRef.label}
              </Badge>
            )}
            {tagOrigine && (
              <Badge className='bg-accent5 text-fg'>
                {tagOrigine.emoji} {tagOrigine.label}
              </Badge>
            )}
            {tagVibe && (
              <Badge className='bg-accent3 text-fg'>
                {tagVibe.emoji} {tagVibe.label}
              </Badge>
            )}
          </div>

          {ref_data.contexte && (
            <p className='text-sm text-fg/70 line-clamp-3'>{ref_data.contexte}</p>
          )}

          <div className='flex justify-start'>
            <Link href={`/ref/${ref_data.slug}`}>
              <Button size='sm' className='rounded-lg'>
                <PlusCircleIcon />
                Enrichir la ref
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Centered Player */}
      <div className='relative z-10'>
        <MediaEmbed url={ref_data.media_url} mediaType={ref_data.media_type} playing={isPlaying} />
      </div>

      {/* Right action panel */}
      <div className='absolute xl:right-40 lg:right-40 md:right-40 bottom-5 2xl:bottom-22 z-20 flex flex-col gap-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-xl'>
        <div className='flex flex-col gap-2 items-center'>
          <button className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110'>
            <Heart className='w-6 h-6 text-white' />
          </button>
          <span className='text-white text-sm'>{ref_data.likes_count}</span>
        </div>

        <div className='flex flex-col gap-2 items-center'>
          <button className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110'>
            <MessageCircle className='w-6 h-6 text-white' />
          </button>
          <span className='text-white text-sm'>0</span>
        </div>

        <div className='flex flex-col gap-2 items-center'>
          <Link href={`/ref/${ref_data.slug}`}>
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
          </Link>
          <span className='text-white text-sm'>Découvrir</span>
        </div>
      </div>
    </div>
  )
}

export default RefWrapper
