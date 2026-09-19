'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import { ChevronUp, ChevronDown } from 'lucide-react'
import OnboardingGuard from '@/components/OnboardingGuard'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { RefCard } from '@/components/ref/RefCard'
import { FeedDebug } from '@/components/ref/FeedDebug'
import { useInfiniteRefs } from '@/queryOptions/getRefs'
import type { Ref } from '@/lib/types'

/**
 * Slides réellement rendues : l'active et ses deux voisines.
 *
 * Swiper garde une slide par ref dans le DOM — c'est ce qui rend sa mesure
 * stable, et on n'y touche pas. Mais le contenu de chaque slide (carte, barre
 * d'actions en verre, dégradés) n'a pas besoin d'exister pour une ref qui est
 * à dix écrans. Au-delà de la voisine immédiate, la slide reste une boîte
 * vide de la bonne taille : après cinquante swipes, le DOM pèse trois cartes,
 * pas cinquante.
 */
const RAYON_RENDU = 1

export function Feed() {
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

  /**
   * Remesure : les slides arrivent après l'init de Swiper, et une mesure faite
   * trop tôt le laisse avec des tailles fausses.
   *
   * Uniquement quand le nombre de refs change. L'effet dépendait aussi de
   * `activeIndex`, donc `update()` tournait à chaque changement de slide —
   * c'est-à-dire *pendant* la transition, qu'il pouvait faire revenir en
   * arrière.
   */
  useEffect(() => {
    swiper?.update()
  }, [refs.length, swiper])

  // Reprise du « suivant » demandé alors que la page d'après chargeait encore.
  useEffect(() => {
    if (!swiper || !pendingNext.current) return
    if (refs.length > activeIndex + 1) {
      swiper.slideNext()
      pendingNext.current = false
    }
  }, [refs.length, swiper, activeIndex])

  /**
   * Garder des refs d'avance, en se basant sur l'état et non sur l'événement
   * de changement de slide.
   *
   * Le préchargement était accroché à `onSlideChange`, qui ne peut pas se
   * produire quand il n'y a qu'une slide : pas de ref suivante donc pas de
   * changement, pas de changement donc pas de chargement. Le feed se bloquait
   * sur la première ref, et aucun geste ne pouvait l'en sortir.
   */
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && refs.length - activeIndex < 3) {
      fetchNextPage()
    }
  }, [refs.length, activeIndex, hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSlideChange = (s: SwiperType) => {
    setActiveIndex(s.activeIndex)
  }

  const toggleMuted = useCallback(() => setMuted((m) => !m), [])

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
      <div className='h-dvh flex items-center justify-center bg-bg'>
        <p className='font-supplymono text-fg/60 animate-pulse'>Chargement des refs…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='h-dvh flex items-center justify-center bg-bg'>
        <p className='font-supplymono text-accent1'>Erreur de chargement. Réessaie.</p>
      </div>
    )
  }

  if (refs.length === 0) {
    return (
      <div className='h-dvh flex flex-col items-center justify-center gap-4 bg-bg'>
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
      <div data-lenis-prevent className='relative h-dvh'>
        <FeedDebug swiper={swiper} />

        {/*
          Le feed est le seul écran sans en-tête (voir `MainShell`) : plein
          cadre, comme un Reels. Le menu revient donc ici, en surimpression.
        */}
        <SidebarTrigger className='glass absolute left-3 top-3 z-30 h-10 w-10 rounded-full text-white hover:bg-white/15 hover:text-white md:hidden' />
        <Swiper
          direction='vertical'
          slidesPerView={1}
          mousewheel
          keyboard={{ enabled: true }}
          // Swiper annule le pointerdown par défaut, ce qui supprime le click
          // qui suit : le tap play/pause de la RefCard ne partait jamais.
          touchStartPreventDefault={false}
          // `touch-action: none` en style inline, pas en classe : il doit
          // gagner à coup sûr sur le `touch-action: pan-x` que la feuille de
          // Swiper pose sur ce même élément, et l'ordre des feuilles de style
          // n'est pas garanti au build.
          //
          // C'est la déclaration qui dit au navigateur de ne traiter AUCUN
          // geste lui-même sur cette zone. Sans elle, il lui suffit de croire
          // qu'il peut faire défiler quelque chose pour s'emparer du geste au
          // niveau du compositeur — auquel cas les `touchmove` ne remontent
          // jamais jusqu'à Swiper, et le swipe « ne capture pas ».
          style={{ touchAction: 'none' }}
          // Swiper abandonne un drag qui démarre sur l'élément déjà focus,
          // s'il fait partie de `focusableElements` — le garde-fou pensé pour
          // ne pas voler le geste d'un champ texte. `button` étant dans la
          // liste par défaut, un seul tap sur la couche de tap play/pause (ou
          // sur le bouton son, ou sur le like) la laissait focus et TUAIT tous
          // les swipes suivants partant de là. Aucun champ texte dans le feed :
          // on sort `button` de la liste.
          focusableElements='input, select, option, textarea, video, label'
          // Swiper se verrouille tout seul (`isLocked`, et `allowSlideNext`
          // passe à false) quand il mesure une seule position d'arrêt — ce qui
          // arrive s'il mesure au mauvais moment, avant que les slides aient
          // leur hauteur. Il ne bouge plus d'un pixel, ni au doigt ni via
          // `slideNext()`. Il y a toujours plus d'une ref ici : on retire ce
          // verrou plutôt que de dépendre de la mesure.
          watchOverflow={false}
          /*
            Seuils de validation du geste — les valeurs par défaut de Swiper
            sont celles d'un carrousel, pas d'un feed.

            Par défaut, un geste qui dure plus de `longSwipesMs` (300 ms) ne
            change de slide que s'il a parcouru `longSwipesRatio` (50 %) de la
            hauteur. Mesuré ici : un swipe de 300px en 500 ms sur un écran de
            664px suit le doigt (`translate: -286`) puis **revient en arrière**,
            parce qu'il manque 7 %. C'est exactement ce qu'on ressent comme
            « le swipe ne marche pas » : le feed bouge sous le doigt et refuse
            de changer de ref.

            À 15 %, un geste franc mais posé passe — celui qu'on fait
            réellement sur TikTok ou Reels. Les flicks rapides continuent de
            passer par `shortSwipes`, qui ne regarde que la vitesse.

            `threshold` : 5px de jeu avant de considérer que c'est un drag.
            Sans lui, le moindre tremblement pendant un tap ouvre un geste que
            Swiper annulera — et le tap play/pause est perdu.
          */
          longSwipesRatio={0.15}
          longSwipesMs={200}
          threshold={5}
          modules={[Mousewheel, Keyboard]}
          // Un peu plus vif que les 300 ms par défaut : le geste est déjà
          // validé quand la transition part, elle n'a pas à traîner.
          speed={260}
          className='h-full'
          onSwiper={setSwiper}
          onSlideChange={handleSlideChange}
        >
          {refs.map((ref, index) => (
            <SwiperSlide key={ref.id}>
              {Math.abs(index - activeIndex) <= RAYON_RENDU ? (
                <RefCard
                  ref_data={ref}
                  isActive={index === activeIndex}
                  muted={muted}
                  onToggleMuted={toggleMuted}
                />
              ) : (
                <div aria-hidden className='h-full w-full bg-[var(--bg2)]' />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/*
          Le chargement de la page suivante se dit par-dessus, jamais en slide.

          En slide, il en ajoutait puis en retirait une pendant que
          l'utilisateur swipait — le préchargement se déclenche à trois refs de
          la fin — et Swiper recomptait ses slides en plein geste.
        */}
        {isFetchingNextPage && (
          <div className='pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2'>
            <span className='glass rounded-full px-3 py-1.5 font-supplymono text-[11px] uppercase tracking-wider text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]'>
              Plus de refs…
            </span>
          </div>
        )}

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
