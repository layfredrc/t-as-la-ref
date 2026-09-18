'use client'
import { useEffect, useRef, useState } from 'react'
import './MemeVortex.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { GlowingEffect } from '../ui/glowing-effect'

gsap.registerPlugin(ScrollTrigger)

const BLOCKS = Array.from({ length: 16 }, (_, i) => i + 1)

const MemeVortex = () => {
  const sectionRef = useRef<HTMLElement | null>(null)

  // L'effet de halo suit le pointeur : sur un écran tactile il n'y a rien à
  // suivre, et son écouteur `pointermove` mesurait le bouton à chaque
  // mouvement de doigt pendant le scroll.
  const [pointeurFin, setPointeurFin] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setPointeurFin(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  useGSAP(
    () => {
      const root = sectionRef.current
      if (!root) return
      const cursor = root.querySelector<HTMLDivElement>('.cursor')
      const blocks = root.querySelectorAll<HTMLElement>('.vortex-block')

      // ---- curseur maison (desktop uniquement, voir le CSS) ----
      const onMouseMove = (e: MouseEvent) => {
        if (!cursor) return
        gsap.to(cursor, { duration: 0.0125, x: e.clientX - 5, y: e.clientY - 5, opacity: 1 })
      }
      document.addEventListener('mousemove', onMouseMove)

      // ---- vortex ----
      // L'animation ne tourne que quand la section est à l'écran : elle
      // bouclait auparavant en continu, sur `top`/`left` de 16 éléments,
      // même pendant qu'on lisait le hero deux écrans plus haut.
      const duration = 0.25
      const repeatDelay = 0.075 * (blocks.length - 1)

      const tween = gsap.from(blocks, {
        duration: 5,
        scale: 0,
        top: '50%',
        left: '50%',
        transform: 'translateZ(-200px)',
        stagger: { each: duration, repeat: -1, repeatDelay },
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          toggleActions: 'play pause resume pause',
        },
      })

      // ---- clic → explosion + disparition temporaire ----
      let previousGif: HTMLImageElement | null = null
      const handlers = new Map<HTMLElement, (e: MouseEvent) => void>()

      blocks.forEach((block) => {
        const onClick = (e: MouseEvent) => {
          const { clientX: x, clientY: y } = e
          previousGif?.remove()

          const gif = document.createElement('img')
          gif.src = '/explosion.gif'
          gif.alt = ''
          gif.style.position = 'fixed'
          gif.style.left = `${x}px`
          gif.style.top = `${y}px`
          gif.style.transform = 'translate(-50%, -50%) scale(2)'
          gif.style.pointerEvents = 'none'
          gif.style.zIndex = '99999'
          document.body.appendChild(gif)

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

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        tween.scrollTrigger?.kill()
        tween.kill()
        previousGif?.remove()
        blocks.forEach((block) => {
          const h = handlers.get(block)
          if (h) block.removeEventListener('click', h)
        })
      }
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} className='meme-vortex'>
      <div className='cursor'>
        {/* eslint-disable-next-line @next/next/no-img-element -- curseur décoratif, 60px */}
        <img src='/cursor.png' alt='' width={60} height={60} />
      </div>

      <div className='content'>
        <div className='header'>
          <h1>T&apos;as la ref ?</h1>
          <p>La mémoire collective du chaos numérique</p>
        </div>
      </div>

      <div className='container'>
        <div className='gallery'>
          {BLOCKS.map((n) => (
            <div key={n} className={`vortex-block vortex-block-${n}`} />
          ))}
        </div>
      </div>
      <div className='absolute bottom-[15%] flex left-1/2 -translate-x-1/2 items-center text-white justify-center font-supplymono rounded-xl'>
        {pointeurFin && (
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={280}
            borderWidth={2.5}
            inactiveZone={0.5}
          />
        )}
        <Link
          href='/feed'
          className='group relative px-5 py-3 sm:px-6 rounded-xl text-white uppercase text-base whitespace-nowrap text-center sm:text-2xl
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
