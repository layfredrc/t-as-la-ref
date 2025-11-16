'use client'

import React from 'react'
import ReactPlayer from 'react-player'
import { Heart, Share2, Bookmark, MessageCircle, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

type ShortsPlayerProps = {
  url: string
  username?: string
  title?: string
  music?: string
  className?: string
}

export const VideoPlayer = ({ url, className }: ShortsPlayerProps) => {
  const [playing, setPlaying] = React.useState(true)
  const [muted, setMuted] = React.useState(false)

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
        playing={playing}
        loop
        controls
        width='100%'
        height='100%'
        muted={muted}
        className='!absolute !top-0 !left-0 z-0'
      />
    </div>
  )
}
