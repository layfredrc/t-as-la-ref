'use client'

import React, { useMemo, useRef } from 'react'
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

export default function Hero() {
  const heroImgWrapperRef = useRef<HTMLDivElement | null>(null) // target
  const heroImgHolderRef = useRef<HTMLElement | null>(null) // trigger
  const imgRef = useRef<HTMLImageElement | null>(null)

  let scrollTriggerInstance: globalThis.ScrollTrigger | null = null

  const imagePaths = useMemo(
    () => Array.from({ length: 13 }, (_, i) => `/images/hero/img${i + 1}.jpg`),
    [],
  )

  // slideshow
  useGSAP(() => {
    let currentImageIndex = 1
    const totalImages = 13

    setInterval(() => {
      currentImageIndex = currentImageIndex >= totalImages ? 1 : currentImageIndex + 1
      if (imgRef.current) imgRef.current.src = `/images/hero/img${currentImageIndex}.jpg`
    }, 500)
  })

  // scroll

  const initAnimations = () => {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill()
    }

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: '.hero-img-holder',
      start: 'top bottom',
      end: 'top top',
      markers: true,
      onUpdate: (self) => {
        const progress = self.progress
        gsap.set('.hero-img', {
          y: `${-110 + 110 * progress}%`,
          scale: 0.25 + 0.75 * progress,
          rotation: -15 + 15 * progress,
        })
      },
    })
  }
  useGSAP(() => {
    initAnimations()
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
            <a href='https://github.com/layfredrc' target='_blank' rel='noopener noreferrer'>
              <GithubLogoIcon size={32} />
            </a>
            <a href='https://x.com/layfredrc_' target='_blank' rel='noopener noreferrer'>
              <XLogoIcon size={32} />
            </a>
            <a
              href='https://www.linkedin.com/in/frederic-lay/'
              target='_blank'
              rel='noopener noreferrer'
            >
              <LinkedinLogoIcon size={32} />
            </a>
            <a
              href='https://www.instagram.com/layfredrc_/'
              target='_blank'
              rel='noopener noreferrer'
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

      <section className='hero-img-holder' ref={heroImgHolderRef}>
        <div className='hero-img' ref={heroImgWrapperRef}>
          <img src={imagePaths[0]} alt='' ref={imgRef} />
        </div>
      </section>
    </div>
  )
}
