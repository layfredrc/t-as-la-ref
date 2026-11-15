'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './Hero.css'
import {
  GithubLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  PauseIcon,
  PlayIcon,
  XLogoIcon,
} from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Photos du diaporama. Recompressées (1600px max, ≈ 60 Ko chacune) : les
 * originaux pesaient jusqu'à 1,6 Mo, et l'un d'eux était un AVIF renommé en
 * .jpg que certains navigateurs n'affichaient pas.
 */
const HERO_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20].map(
  (n) => `/images/home/hero-${String(n).padStart(2, '0')}.jpg`,
)

const SLIDE_MS = 500

export default function Hero() {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const holderRef = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  // Le visiteur peut figer le diaporama ; « réduire les animations » le fige
  // d'office, sans l'empêcher de le relancer à la main.
  const [paused, setPaused] = useState<boolean | null>(null)
  const isPaused = paused ?? reduced

  /**
   * Diaporama.
   *
   * L'intervalle est arrêté quand la section quitte l'écran, que l'onglet
   * passe en arrière-plan ou que le diaporama est en pause, et nettoyé au
   * démontage.
   *
   * Les images suivantes sont préchargées dès que la section approche, pour
   * que la première boucle ne clignote pas au rythme du réseau.
   */
  useEffect(() => {
    const holder = holderRef.current
    if (!holder || isPaused) return

    let index = HERO_IMAGES.findIndex((src) => imgRef.current?.src.endsWith(src))
    if (index < 0) index = 0
    let timer: number | null = null
    let visible = false
    let preloaded = false

    const tick = () => {
      index = (index + 1) % HERO_IMAGES.length
      if (imgRef.current) imgRef.current.src = HERO_IMAGES[index]
    }
    const start = () => {
      if (timer !== null || !visible || document.hidden) return
      timer = window.setInterval(tick, SLIDE_MS)
    }
    const stop = () => {
      if (timer === null) return
      window.clearInterval(timer)
      timer = null
    }
    const preload = () => {
      if (preloaded) return
      preloaded = true
      HERO_IMAGES.slice(1).forEach((src) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = src
      })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          preload()
          start()
        } else {
          stop()
        }
      },
      { rootMargin: '50% 0px' },
    )
    observer.observe(holder)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [isPaused])

  // Entrée de l'image au scroll. Sous « réduire les animations », rien ne se
  // crée : l'image est déjà à sa place (voir Hero.css). Le contexte de
  // useGSAP tue le trigger au démontage.
  useGSAP(
    () => {
      const holder = holderRef.current
      if (!holder) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        ScrollTrigger.create({
          // L'élément lui-même, pas le sélecteur : avec `scope`, un sélecteur
          // ne cherche que dans les descendants, et la section n'en fait pas
          // partie. Le trigger ne se créait pas, l'image restait garée hors
          // champ.
          trigger: holder,
          start: 'top bottom',
          end: 'top top',
          onUpdate: (self) => {
            const progress = self.progress
            gsap.set('.hero-img', {
              y: `${-110 + 110 * progress}%`,
              scale: 0.3 + 0.7 * progress,
              rotation: -15 + 15 * progress,
            })
            // Le bouton pause n'apparaît qu'une fois l'image arrivée :
            // avant, il flotterait seul au bas d'une section vide.
            gsap.set('.hero-img-toggle', { autoAlpha: progress > 0.9 ? 1 : 0 })
          },
        })
      })
      return () => mm.revert()
    },
    { scope: holderRef },
  )

  return (
    <div>
      <section className='hero'>
        <h1 className='hero-title'>
          <span className='hero-header hero-header-1'>T&apos;as</span>
          <span className='hero-header hero-header-2'>la ref ?</span>
        </h1>

        <div className='hero-intro'>
          <p className='hero-lead'>
            La bibliothèque des références internet francophones, écrite par la communauté.
          </p>
        </div>

        <div className='hero-footer'>
          <div className='hero-footer-symbols flex flex-row gap-2 '>
            <a
              href='https://github.com/layfredrc'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
            >
              <GithubLogoIcon size={32} />
            </a>
            <a
              href='https://x.com/layfredrc_'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='X'
            >
              <XLogoIcon size={32} />
            </a>
            <a
              href='https://www.linkedin.com/in/frederic-lay/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='LinkedIn'
            >
              <LinkedinLogoIcon size={32} />
            </a>
            <a
              href='https://www.instagram.com/layfredrc_/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
            >
              <InstagramLogoIcon size={32} />
            </a>
          </div>
          <div className='hero-footer-scroll-down'>
            <a href='https://bento.me/layfredrc' target='_blank' rel='noopener noreferrer'>
              <p className='font-supplymono'>@layfredrc / 2025</p>
            </a>
          </div>
          <div className='hero-footer-tags '>
            <p className='font-supplymono'>SCROLL DOWN ↓</p>
          </div>
        </div>
      </section>

      <section className='hero-img-holder' ref={holderRef}>
        <div className='hero-img'>
          {/* eslint-disable-next-line @next/next/no-img-element -- la `src` change toutes les 500 ms, next/image n'apporte rien ici */}
          <img src={HERO_IMAGES[0]} alt='' ref={imgRef} decoding='async' loading='lazy' />
        </div>
        <button
          type='button'
          className='hero-img-toggle'
          onClick={() => setPaused(!isPaused)}
          aria-pressed={isPaused}
          aria-label={isPaused ? 'Relancer le diaporama' : 'Mettre le diaporama en pause'}
        >
          {isPaused ? <PlayIcon size={20} weight='fill' /> : <PauseIcon size={20} weight='fill' />}
        </button>
      </section>
    </div>
  )
}
