'use client'

import { useState, useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import { ChevronUp, ChevronDown } from 'lucide-react'
import OnboardingGuard from '@/components/OnboardingGuard'
import { RefCard } from '@/components/ref/RefCard'
import { FeedDebug } from '@/components/ref/FeedDebug'
import { useInfiniteRefs } from '@/queryOptions/getRefs'
import type { Ref } from '@/lib/types'

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteRefs()

  const refs: Ref[] = data?.pages.flatMap((p) => p.data) ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  // Les vidéos démarrent muettes — seule lecture qu'un mobile autorise sans
  // geste (voir VideoPlayer). Le choix de l'utilisateur vaut ensuite pour
  // tout le feed, pas seulement pour la ref où il a appuyé.
  const [muted, setMuted] = useState(true)
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
      <div className='h-[calc(100dvh-4rem)] md:h-dvh flex items-center justify-center bg-bg'>
        <p className='font-supplymono text-fg/60 animate-pulse'>Chargement des refs…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='h-[calc(100dvh-4rem)] md:h-dvh flex items-center justify-center bg-bg'>
        <p className='font-supplymono text-accent1'>Erreur de chargement. Réessaie.</p>
      </div>
    )
  }

  if (refs.length === 0) {
    return (
      <div className='h-[calc(100dvh-4rem)] md:h-dvh flex flex-col items-center justify-center gap-4 bg-bg'>
        <p className='font-rader text-5xl uppercase'>Rien ici…</p>
        <p className='font-supplymono text-fg/60'>Sois le premier à ajouter une ref !</p>
      </div>
    )
  }

  return (
    <>
      <OnboardingGuard />

      {/*
        `data-lenis-prevent` : Lenis enveloppe toute l'app (voir
        `client-layout.tsx`) et, avec `syncTouch`, il capte les gestes
        verticaux pour animer son propre scroll. Sur mobile il entrait donc en
        concurrence directe avec le swipe du feed. L'attribut le fait passer
        son tour sur cette zone — le geste appartient à Swiper.
      */}
      <div data-lenis-prevent className='relative h-[calc(100dvh-4rem)] md:h-dvh'>
        <FeedDebug swiper={swiper} />
        <Swiper
          direction='vertical'
          slidesPerView={1}
          mousewheel
          keyboard={{ enabled: true }}
          // Swiper annule le pointerdown par défaut, ce qui supprime le click
          // qui suit : le tap play/pause de la RefCard ne partait jamais.
          touchStartPreventDefault={false}
          // Swiper abandonne un drag qui démarre sur l'élément déjà focus,
          // s'il fait partie de `focusableElements` — le garde-fou pensé pour
          // ne pas voler le geste d'un champ texte. `button` étant dans la
          // liste par défaut, un seul tap sur la couche de tap play/pause (ou
          // sur le bouton son, ou sur le like) la laissait focus et TUAIT tous
          // les swipes suivants partant de là. Aucun champ texte dans le feed :
          // on sort `button` de la liste.
          focusableElements='input, select, option, textarea, video, label'
          modules={[Mousewheel, Keyboard]}
          className='h-full'
          onSwiper={setSwiper}
          onSlideChange={handleSlideChange}
        >
          {refs.map((ref, index) => (
            <SwiperSlide key={ref.id}>
              <RefCard
                ref_data={ref}
                isActive={index === activeIndex}
                muted={muted}
                onToggleMuted={() => setMuted((m) => !m)}
              />
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

        {/* Navigation arrows — centered vertically on the right.
            Masquées sur mobile : elles tombaient pile sur la barre d'actions
            (même `right-4`), et le swipe les rend inutiles au doigt. */}
        <div className='absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 sm:flex'>
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
