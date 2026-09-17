'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import { ChevronDown, ChevronUp } from 'lucide-react'
import OnboardingGuard from '@/components/OnboardingGuard'
import { RefPosterCard } from '@/components/ref/RefPosterCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useInfiniteRefs } from '@/queryOptions/getRefs'
import { useRefThumbnails } from '@/queryOptions/getThumbnails'
import type { Ref } from '@/lib/types'

/**
 * Le lecteur n'est chargé qu'au premier tap.
 *
 * C'est la contrepartie concrète du poster-first : `react-player` et les web
 * components `youtube-video-element` / `tiktok-video-element` ne sont plus
 * dans le bundle du feed. Naviguer dans le catalogue ne coûte plus rien, et le
 * code du lecteur n'arrive que quand on décide de regarder.
 */
const RefPlayerOverlay = dynamic(
  () => import('@/components/ref/RefPlayerOverlay').then((m) => m.RefPlayerOverlay),
  { ssr: false },
)

/** Affiches chargées d'avance de part et d'autre de la ref courante. */
const PRELOAD_RADIUS = 2

export default function FeedV2Page() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteRefs()

  const refs: Ref[] = data?.pages.flatMap((p) => p.data) ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  /** Index de la ref en cours de lecture — `null` quand on navigue. */
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const pendingNext = useRef(false)

  // Vignettes qui ne se déduisent pas de l'URL (TikTok) — un seul appel pour
  // tout le feed, voir `useRefThumbnails`.
  const { data: oembedThumbnails } = useRefThumbnails(refs)

  // Les slides arrivent après l'init de Swiper : une mesure faite trop tôt le
  // laisse avec des tailles fausses. On le remet à jour, et on rattrape le
  // « suivant » demandé pendant un chargement.
  useEffect(() => {
    if (!swiper) return
    swiper.update()
    if (pendingNext.current && refs.length > activeIndex + 1) {
      swiper.slideNext()
      pendingNext.current = false
    }
  }, [refs.length, swiper, activeIndex])

  // Garder des refs d'avance, en se basant sur l'état et non sur l'événement
  // de changement de slide — qui ne peut pas se produire quand il n'y a qu'une
  // seule slide (voir le feed d'origine, qui s'y bloquait).
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && refs.length - activeIndex < 3) {
      fetchNextPage()
    }
  }, [refs.length, activeIndex, hasNextPage, isFetchingNextPage, fetchNextPage])

  /**
   * On ne swipe pas pendant qu'on regarde. Suspendre Swiper plutôt que de
   * compter sur le fait que la couche de lecture recouvre tout : elle est
   * dans un portail, hors de l'arbre du feed, et le clavier continuerait
   * sinon à faire défiler les refs derrière la vidéo.
   */
  useEffect(() => {
    if (!swiper) return
    if (playingIndex !== null) {
      swiper.disable()
    } else {
      swiper.enable()
    }
  }, [swiper, playingIndex])

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
      <div className='flex h-[calc(100dvh-4rem)] items-center justify-center bg-[var(--bg)] px-5 md:h-dvh'>
        <div className='flex h-full w-full max-w-[26rem] flex-col gap-3 py-5 sm:py-8'>
          <Skeleton className='min-h-0 flex-1 rounded-2xl border-2 border-black' />
          <Skeleton className='h-8 w-3/4 rounded-lg' />
          <Skeleton className='h-6 w-1/2 rounded-lg' />
          <Skeleton className='h-20 w-full rounded-lg' />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-[calc(100dvh-4rem)] items-center justify-center bg-[var(--bg)] md:h-dvh'>
        <p className='font-supplymono text-[var(--accent1)]'>Erreur de chargement. Réessaie.</p>
      </div>
    )
  }

  if (refs.length === 0) {
    return (
      <div className='flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 bg-[var(--bg)] md:h-dvh'>
        <p className='font-rader text-5xl uppercase'>Rien ici…</p>
        <p className='font-supplymono text-[var(--fg)]/60'>Sois le premier à ajouter une ref !</p>
      </div>
    )
  }

  const playingRef = playingIndex === null ? null : (refs[playingIndex] ?? null)

  return (
    <>
      <OnboardingGuard />

      {/*
        `data-lenis-prevent` : Lenis enveloppe toute l'app (voir
        `client-layout.tsx`) et capte les gestes verticaux pour animer son
        propre scroll. L'attribut le fait passer son tour ici — le geste
        appartient à Swiper.
      */}
      <div data-lenis-prevent className='relative h-[calc(100dvh-4rem)] md:h-dvh'>
        <Swiper
          direction='vertical'
          slidesPerView={1}
          mousewheel
          keyboard={{ enabled: true }}
          // Swiper annule le `pointerdown` par défaut, ce qui supprime le
          // `click` qui suit : le tap « lire » de la carte ne partirait jamais.
          touchStartPreventDefault={false}
          // Swiper abandonne un drag qui démarre sur l'élément déjà focus s'il
          // fait partie de `focusableElements`. `button` y est par défaut : un
          // seul tap sur l'affiche (qui est un bouton) la laissait focus et
          // tuait tous les swipes suivants partant de là. Aucun champ texte
          // dans le feed, on sort `button` de la liste.
          focusableElements='input, select, option, textarea, video, label'
          // Swiper se verrouille tout seul quand il mesure une seule position
          // d'arrêt — ce qui arrive s'il mesure avant que les slides aient leur
          // hauteur. Il ne bouge alors plus, ni au doigt ni via `slideNext()`.
          watchOverflow={false}
          modules={[Mousewheel, Keyboard]}
          className='h-full'
          onSwiper={setSwiper}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        >
          {refs.map((ref, index) => (
            <SwiperSlide key={ref.id}>
              <RefPosterCard
                ref_data={ref}
                oembedThumbnail={oembedThumbnails?.[ref.media_url] ?? null}
                priority={Math.abs(index - activeIndex) <= PRELOAD_RADIUS}
                onOpenPlayer={() => setPlayingIndex(index)}
              />
            </SwiperSlide>
          ))}

          {isFetchingNextPage && (
            <SwiperSlide>
              <div className='flex h-full items-center justify-center bg-[var(--bg)]'>
                <p className='animate-pulse font-supplymono text-[var(--fg)]/60'>Plus de refs…</p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/*
          Barre de position — un catalogue, ça se parcourt : on dit toujours où
          on en est et combien il en reste. En surimpression plutôt qu'en
          hauteur prise sur Swiper, qui mesure mal dès qu'on lui change sa
          boîte ; c'est la carte qui réserve la place (`pt-14`).

          `pointer-events-none` : rien ne doit intercepter le geste au-dessus
          des slides.
        */}
        <div
          data-testid='feed-position'
          className='pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-5 pt-4'
        >
          <span className='shrink-0 rounded-full border-2 border-black bg-[var(--bg)] px-2.5 py-1 font-supplymono text-[10px] uppercase tracking-wider tabular-nums text-[var(--fg)]'>
            {String(activeIndex + 1).padStart(2, '0')}
            <span className='text-[var(--fg)]/40'> / </span>
            {String(refs.length).padStart(2, '0')}
            {hasNextPage && <span className='text-[var(--fg)]/40'>+</span>}
          </span>

          <span className='h-1.5 flex-1 overflow-hidden rounded-full border border-black/20 bg-[var(--fg)]/10'>
            <span
              className='block h-full rounded-full bg-[var(--fg)]/60 transition-[width] duration-300 ease-out'
              style={{ width: `${((activeIndex + 1) / refs.length) * 100}%` }}
            />
          </span>
        </div>

        {/* Flèches — desktop seulement, le doigt s'en passe. */}
        <div className='absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 sm:flex'>
          <button
            onClick={() => swiper?.slidePrev()}
            disabled={activeIndex === 0}
            className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[var(--bg)] text-[var(--fg)] transition-all hover:scale-110 hover:bg-[var(--accent2)] disabled:opacity-30 disabled:hover:scale-100'
            aria-label='Ref précédente'
          >
            <ChevronUp className='h-5 w-5' />
          </button>
          <button
            onClick={goNext}
            disabled={!hasNextPage && activeIndex === refs.length - 1}
            className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[var(--bg)] text-[var(--fg)] transition-all hover:scale-110 hover:bg-[var(--accent2)] disabled:opacity-30 disabled:hover:scale-100'
            aria-label='Ref suivante'
          >
            <ChevronDown className='h-5 w-5' />
          </button>
        </div>
      </div>

      {playingRef && (
        <RefPlayerOverlay ref_data={playingRef} onClose={() => setPlayingIndex(null)} />
      )}
    </>
  )
}
