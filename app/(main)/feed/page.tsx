'use client'

import { useState, useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import { ChevronUp, ChevronDown } from 'lucide-react'
import OnboardingGuard from '@/components/OnboardingGuard'
import { RefCard } from '@/components/ref/RefCard'
import { useInfiniteRefs } from '@/queryOptions/getRefs'
import type { Ref } from '@/lib/types'

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteRefs()

  const refs: Ref[] = data?.pages.flatMap((p) => p.data) ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const pendingNext = useRef(false)

  // When new refs load and we were waiting to advance, slide to next
  useEffect(() => {
    if (pendingNext.current && swiper && refs.length > activeIndex + 1) {
      swiper.slideNext()
      pendingNext.current = false
    }
  }, [refs.length, swiper, activeIndex])

  const handleSlideChange = (s: SwiperType) => {
    setActiveIndex(s.activeIndex)
    if (s.activeIndex >= refs.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const goNext = () => {
    if (activeIndex < refs.length - 1) {
      swiper?.slideNext()
    } else if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
      pendingNext.current = true
    }
  }

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-bg'>
        <p className='font-supplymono text-fg/60 animate-pulse'>Chargement des refs…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='h-screen flex items-center justify-center bg-bg'>
        <p className='font-supplymono text-accent1'>Erreur de chargement. Réessaie.</p>
      </div>
    )
  }

  if (refs.length === 0) {
    return (
      <div className='h-screen flex flex-col items-center justify-center gap-4 bg-bg'>
        <p className='font-rader text-5xl uppercase'>Rien ici…</p>
        <p className='font-supplymono text-fg/60'>Sois le premier à ajouter une ref !</p>
      </div>
    )
  }

  return (
    <>
      <OnboardingGuard />

      <div className='h-screen relative'>
        <Swiper
          direction='vertical'
          slidesPerView={1}
          mousewheel
          keyboard={{ enabled: true }}
          modules={[Mousewheel, Keyboard]}
          className='h-full'
          onSwiper={setSwiper}
          onSlideChange={handleSlideChange}
        >
          {refs.map((ref, index) => (
            <SwiperSlide key={ref.id}>
              <RefCard ref_data={ref} isActive={index === activeIndex} />
            </SwiperSlide>
          ))}

          {isFetchingNextPage && (
            <SwiperSlide>
              <div className='h-full flex items-center justify-center bg-bg'>
                <p className='font-supplymono text-fg/60 animate-pulse'>Plus de refs…</p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Navigation arrows — centered vertically on the right */}
        <div className='absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3'>
          <button
            onClick={() => swiper?.slidePrev()}
            disabled={activeIndex === 0}
            className='w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all disabled:opacity-30'
            aria-label='Ref précédente'
          >
            <ChevronUp className='w-5 h-5' />
          </button>
          <button
            onClick={goNext}
            disabled={!hasNextPage && activeIndex === refs.length - 1}
            className='w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all disabled:opacity-30'
            aria-label='Ref suivante'
          >
            <ChevronDown className='w-5 h-5' />
          </button>
        </div>
      </div>
    </>
  )
}
