'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './Hero.css'
import {
  GithubLogoIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from '@phosphor-icons/react'

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

  /**
   * Diaporama.
   *
   * L'intervalle est arrêté quand la section quitte l'écran ou que l'onglet
   * passe en arrière-plan, et nettoyé au démontage : la version précédente
   * tournait pour toujours, y compris une fois parti sur le feed, en changeant
   * la `src` d'une image qui n'était plus dans la page.
   *
   * Les images suivantes sont préchargées dès que la section approche, pour
   * que la première boucle ne clignote pas au rythme du réseau.
   */
  useEffect(() => {
    const holder = holderRef.current
    if (!holder) return

    let index = 0
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
  }, [])

  // Entrée de l'image au scroll. Le ScrollTrigger est créé dans le contexte
  // de useGSAP, qui le tue au démontage.
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: '.hero-img-holder',
      start: 'top bottom',
      end: 'top top',
      onUpdate: (self) => {
        const progress = self.progress
        gsap.set('.hero-img', {
          y: `${-110 + 110 * progress}%`,
          scale: 0.3 + 0.7 * progress,
          rotation: -15 + 15 * progress,
        })
      },
    })
  })

  return (
    <div>
      <section className='hero'>
        <div className='hero-header-wrapper'>
          <div className='hero-header hero-header-1'>
            <h1>T&apos;as</h1>
          </div>
          <div className='hero-header hero-header-2'>
            <h1>la ref ?</h1>
          </div>
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
      </section>
    </div>
  )
}
