'use client'
import { useRef } from 'react'
import './MemeVortex.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { GlowingEffect } from '../ui/glowing-effect'

const MemeVortex = () => {
  const sectionRef = useRef<HTMLElement | null>(null)

  useGSAP(
    (ctx) => {
      const root = sectionRef.current!
      // Scoped queries (no global side-effects)
      const cursor = root.querySelector<HTMLDivElement>('.cursor')!
      const blocks = root.querySelectorAll<HTMLElement>('.block')

      // ---- custom cursor (fixed to viewport) ----
      const onMouseMove = (e: MouseEvent) => {
        gsap.to(cursor, { duration: 0.0125, x: e.clientX - 5, y: e.clientY - 5 })
      }
      // use document to keep cursor alive even when mouse leaves section
      document.addEventListener('mousemove', onMouseMove)

      // ---- vortex animation ----
      const duration = 0.25
      const repeatDelay = 0.075 * (blocks.length - 1)

      const tween = gsap.from(blocks, {
        duration: 5,
        scale: 0,
        top: '50%',
        left: '50%',
        transform: 'translateZ(-200px)',
        stagger: { each: duration, repeat: -1, repeatDelay },
      })

      // ---- click → explosion gif + temporary hide ----
      let previousGif: HTMLImageElement | null = null
      const handlers = new Map<HTMLElement, (e: MouseEvent) => void>()

      blocks.forEach((block) => {
        const onClick = (e: MouseEvent) => {
          const { clientX: x, clientY: y } = e

          // remove previous explosion if still there
          previousGif?.remove()

          const gif = document.createElement('img')
          gif.src = '/explosion.gif'
          gif.alt = ''
          gif.style.position = 'fixed' // stays at viewport position
          gif.style.left = `${x}px`
          gif.style.top = `${y}px`
          gif.style.transform = 'translate(-50%, -50%) scale(2)'
          gif.style.pointerEvents = 'none'
          gif.style.zIndex = '99999'
          gif.style.willChange = 'transform, opacity'

          document.body.appendChild(gif)

          // ensure it paints at least once, then remove after 600ms
          requestAnimationFrame(() => {
            setTimeout(() => gif.remove(), 600)
          })
          previousGif = gif

          block.style.display = 'none'
          setTimeout(() => {
            block.style.display = 'block'
          }, 5000)
        }

        handlers.set(block, onClick)
        block.addEventListener('click', onClick)
      })

      // ---- CLEANUP ----
      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        tween?.kill()
        previousGif?.remove()
        blocks.forEach((block) => {
          const h = handlers.get(block)
          if (h) block.removeEventListener('click', h)
        })
      }
    },
    { scope: sectionRef }, // <- selectors & GSAP scoped to section
  )

  return (
    <section ref={sectionRef} className='meme-vortex'>
      <div className='cursor'>
        <img src='/cursor.png' alt='' />
      </div>

      <div className='content'>
        <div className='header'>
          <h1>T'as la ref ?</h1>
          <p>La mémoire collective du chaos numérique</p>
        </div>
      </div>

      <div className='container'>
        <div className='gallery'>
          <div className='block block-1' />
          <div className='block block-2' />
          <div className='block block-3' />
          <div className='block block-4' />
          <div className='block block-5' />
          <div className='block block-6' />
          <div className='block block-7' />
          <div className='block block-8' />
          <div className='block block-9' />
          <div className='block block-10' />
          <div className='block block-11' />
          <div className='block block-12' />
          <div className='block block-13' />
          <div className='block block-14' />
          <div className='block block-15' />
          <div className='block block-16' />
        </div>
      </div>
      <div className='absolute bottom-[15%] flex left-1/2 -translate-x-1/2 items-center text-white justify-center font-supplymono rounded-xl'>
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={280}
          borderWidth={2.5}
          inactiveZone={0.5}
        />
        <Link
          href='/feed'
          className='group relative px-6 py-3 rounded-xl text-white uppercase text-2xl
             bg-black/50 backdrop-blur-md backdrop-saturate-150
             border border-white/15
             shadow-[0_8px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]
             transition-colors duration-300 overflow-hidden
             hover:bg-black/60 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.10)]'
        >
          <span className='relative z-10'>👾 Accéder au chaos</span>

          {/* Shine sweep */}
          <span
            className='absolute inset-0 rounded-xl pointer-events-none
               bg-gradient-to-r from-transparent via-white/30 to-transparent
               opacity-0 -translate-x-full
               transition-all duration-700 ease-out
               group-hover:opacity-100 group-hover:translate-x-full'
          />

          {/* Polarized tint (subtle rainbow) */}
          <span
            className='absolute inset-0 rounded-xl pointer-events-none mix-blend-screen
               opacity-0 transition-opacity duration-300
               group-hover:opacity-70
               [background:conic-gradient(from_0deg_at_50%_50%,rgba(255,0,102,.12),rgba(0,255,204,.12),rgba(0,128,255,.12),rgba(255,0,102,.12))]'
          />
        </Link>
      </div>
    </section>
  )
}

export default MemeVortex
