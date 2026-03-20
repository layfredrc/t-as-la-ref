'use client'

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
}

export const VideoPlayer = ({
  url,
  playing: externalPlaying = false,
  className,
}: ShortsPlayerProps) => {
  return (
    <div
      className={cn(
        'relative aspect-[9/16] w-full max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-2xl rounded-3xl overflow-hidden bg-black shadow-xl backdrop-blur-md z-50',
        className,
      )}
    >
      {/* Video */}
      <ReactPlayer
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
