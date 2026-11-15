'use client'
import { type CSSProperties, useRef, useState } from 'react'
import './MemeVortex.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import { PauseIcon, PlayIcon } from '@phosphor-icons/react'
import {
  ASCII_BRAND,
  ASCII_BRAND_COLS,
  ASCII_LOGO,
  ASCII_LOGO_COLS,
  ASCII_TITLE_LINE,
  ASCII_TITLE_LINE_COLS,
} from './asciiLogo'

gsap.registerPlugin(ScrollTrigger)

const BLOCKS = Array.from({ length: 16 }, (_, i) => i + 1)

const MemeVortex = () => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const [paused, setPaused] = useState(false)
  // Sous « réduire les animations », le vortex ne tourne pas : pas de bouton
  // pour une animation qui n'existe pas.
  const [animated, setAnimated] = useState(false)

  useGSAP(
    () => {
      const root = sectionRef.current
      if (!root) return
      const cursor = cursorRef.current
      const blocks = root.querySelectorAll<HTMLElement>('.vortex-block')

      // ---- curseur maison (desktop uniquement, voir le CSS) ----
      const onMouseMove = (e: MouseEvent) => {
        if (!cursor) return
        gsap.to(cursor, { duration: 0.0125, x: e.clientX - 5, y: e.clientY - 5, opacity: 1 })
      }
      document.addEventListener('mousemove', onMouseMove)

      // ---- vortex ----
      // Il ne tourne que quand la section est à l'écran, et jamais sous
      // « réduire les animations » : les blocs restent alors posés à leur
      // place, en collage (voir le CSS).
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
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
        tweenRef.current = tween
        setAnimated(true)

        return () => {
          tweenRef.current = null
          setAnimated(false)
        }
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
        mm.revert()
        previousGif?.remove()
        blocks.forEach((block) => {
          const h = handlers.get(block)
          if (h) block.removeEventListener('click', h)
        })
      }
    },
    { scope: sectionRef },
  )

  // Pause du vortex : le tween s'arrête là où il est. Le ScrollTrigger ne
  // le relance pas tant que le visiteur ne l'a pas demandé.
  const togglePause = () => {
    const tween = tweenRef.current
    if (!tween) return
    const next = !paused
    tween.scrollTrigger?.[next ? 'disable' : 'enable'](false)
    if (next) tween.pause()
    else tween.resume()
    setPaused(next)
  }

  return (
    <>
      {/*
        Hors de la section : `content-visibility: auto` lui donne un
        containment de mise en page, ce qui en ferait le bloc conteneur de ce
        `position: fixed` — le curseur suivrait la section, pas la fenêtre.
      */}
      <div ref={cursorRef} className='cursor'>
        {/* eslint-disable-next-line @next/next/no-img-element -- curseur décoratif, 60px */}
        <img src='/cursor.png' alt='' width={60} height={60} />
      </div>
      <section ref={sectionRef} className='meme-vortex' aria-labelledby='vortex-title'>
        <div className='container' aria-hidden='true'>
          <div className='gallery'>
            {BLOCKS.map((n) => (
              <div key={n} className={`vortex-block vortex-block-${n}`} />
            ))}
          </div>
        </div>

        {/* Un terminal rétro au centre : fond plein, les GIF passent derrière,
            jamais sous les mots. */}
        <div className='meme-vortex-content'>
          <div className='vortex-term'>
            <div className='vortex-term-bar' aria-hidden='true'>
              <span>■ chaos.sh</span>
              <span>80×24</span>
            </div>
            <div className='vortex-term-body'>
              {/* L'en-tête de k9s : le contexte à gauche, les raccourcis à
                  droite. Décor : rien ici ne se clique. */}
              <div className='vortex-term-head' aria-hidden='true'>
                <dl className='vortex-term-ctx'>
                  <div>
                    <dt>Context:</dt>
                    <dd>tas-la-ref</dd>
                  </div>
                  <div>
                    <dt>Cluster:</dt>
                    <dd>internet-fr</dd>
                  </div>
                  <div>
                    <dt>User:</dt>
                    <dd>visiteur</dd>
                  </div>
                </dl>
                <ul className='vortex-term-keys'>
                  <li>
                    <kbd>&lt;0&gt;</kbd> tout
                  </li>
                  <li>
                    <kbd>&lt;1&gt;</kbd> culte
                  </li>
                  <li>
                    <kbd>&lt;2&gt;</kbd> gen-z
                  </li>
                  <li>
                    <kbd>&lt;?&gt;</kbd> aide
                  </li>
                </ul>
              </div>

              <h2 id='vortex-title' className='sr-only'>
                T&apos;as la ref&nbsp;?
              </h2>
              {/* Le logo @Ref puis le titre sur la même ligne, comme le logo
                  dans l'en-tête de k9s. Large : le titre sur une ligne.
                  Étroit : le titre sur deux lignes, toujours à côté du logo. */}
              <div
                className='vortex-term-art'
                aria-hidden='true'
                style={
                  {
                    '--cols-wide': ASCII_BRAND_COLS + 3 + ASCII_TITLE_LINE_COLS,
                    '--cols-narrow': ASCII_BRAND_COLS + 3 + ASCII_LOGO_COLS,
                  } as CSSProperties
                }
              >
                <pre className='vortex-term-brand'>{ASCII_BRAND}</pre>
                <pre className='vortex-term-logo vortex-term-logo--wide'>{ASCII_TITLE_LINE}</pre>
                <div className='vortex-term-logo vortex-term-logo--narrow'>
                  {ASCII_LOGO.map((block) => (
                    <pre key={block}>{block}</pre>
                  ))}
                </div>
              </div>

              <p className='vortex-term-line'>
                <span aria-hidden='true'>&gt; </span>La mémoire collective du chaos numérique
                <span className='vortex-term-cursor' aria-hidden='true' />
              </p>
              <Link href='/feed' className='vortex-term-btn'>
                <span aria-hidden='true'>[</span>
                <span>Accéder au chaos</span>
                <span aria-hidden='true'>]</span>
              </Link>
            </div>

            {/* Le bas de l'écran : les miettes de k9s, le mode de vim. */}
            <div className='vortex-term-status' aria-hidden='true'>
              <span className='vortex-term-crumb'>&lt;refs&gt;</span>
              <span className='vortex-term-crumb vortex-term-crumb--alt'>&lt;chaos&gt;</span>
              <span className='vortex-term-mode'>-- NORMAL --</span>
            </div>
          </div>
        </div>

        {animated && (
          <button
            type='button'
            className='meme-vortex-toggle'
            onClick={togglePause}
            aria-pressed={paused}
            aria-label={paused ? 'Relancer le vortex' : 'Mettre le vortex en pause'}
          >
            {paused ? <PlayIcon size={20} weight='fill' /> : <PauseIcon size={20} weight='fill' />}
          </button>
        )}
      </section>
    </>
  )
}

export default MemeVortex
