'use client'

import type { RefObject } from 'react'
import ReactPlayer from 'react-player'
import 'youtube-video-element'
import 'tiktok-video-element'
import { cn } from '@/lib/utils'

type ShortsPlayerProps = {
  url: string
  playing?: boolean
  username?: string
  title?: string
  music?: string
  className?: string
  /**
   * Accès direct à l'élément média. Indispensable sur mobile : le play doit
   * partir du handler de tap lui-même pour rester un « user gesture » aux
   * yeux du navigateur — une prop React appliquée plus tard par un effet
   * perd cette qualité et la lecture est refusée.
   */
  playerRef?: RefObject<HTMLVideoElement | null>
}

export const VideoPlayer = ({
  url,
  playing: externalPlaying = false,
  className,
  playerRef,
}: ShortsPlayerProps) => {
  return (
    <div
      className={cn(
        'relative aspect-[9/16] w-full max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-2xl overflow-hidden rounded-3xl bg-black shadow-xl backdrop-blur-md',
        className,
      )}
    >
      {/* Video */}
      <ReactPlayer
        ref={playerRef}
        src={url}
        playing={externalPlaying}
        loop
        controls
        width='100%'
        height='100%'
        className='!absolute !top-0 !left-0 z-0'
      />
    </div>
  )
}
