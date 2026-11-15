'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import RefVideo from './RefVideo'

gsap.registerPlugin(ScrollTrigger)

export type ManifestPoint = {
  index: string
  title: string
  text: string
  /** Identifiant Tenor de la ref (les 11 caractères avant `AAAA…`). */
  tenorId: string
  /** Nom de la ref, pour le bouton lecture. */
  refName: string
}

/** Grand écran, assez haut : la section s'épingle (tasteskill, `pinned-chapters`). */
// 760 plutôt que les 640 du moment : sous cette hauteur, le titre, les
// quatre points et le bouton ne tiennent plus dans l'écran épinglé.
const LIVE_QUERY = '(min-width: 1024px) and (min-height: 760px)'

/**
 * Les quatre points du manifeste, en chapitres épinglés (tasteskill,
 * moment `pinned-chapters`).
 *
 * En direct (grand écran, sans « réduire les animations ») : la section
 * fait deux écrans et sa scène tient à l'écran pendant un écran de scroll.
 * Chaque quart de ce scroll ouvre un point à gauche (son texte se déplie)
 * et le cadre de droite passe en fondu à la ref de ce point, qui joue.
 *
 * Au repos (téléphone, tablette, écran bas, mouvement réduit, sans
 * script) : rien ne s'épingle, chaque point est une rangée, son texte à
 * gauche et sa ref à droite (empilés sur téléphone). Tout le texte est
 * dans le HTML, à sa place finale : le mouvement ne cache jamais rien.
 */
export default function ManifestChapters({ points }: { points: ManifestPoint[] }) {
  const rootRef = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  const [wide, setWide] = useState(false)
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const live = wide && !reduced

  useEffect(() => {
    const mql = window.matchMedia(LIVE_QUERY)
    const sync = () => setWide(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  // Les refs ne jouent que si la section est à l'écran.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  // Le scroll de la section (deux écrans, donc un écran de course pour la
  // scène épinglée) choisit le point ouvert : un quart chacun.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !live) return
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setActive(Math.min(points.length - 1, Math.floor(self.progress * points.length)))
      },
    })
    return () => trigger.kill()
  }, [live, points.length])

  return (
    <section
      ref={rootRef}
      id='manifeste'
      className={`chapters ${live ? 'is-live' : ''}`}
      aria-labelledby='chapters-title'
    >
      <div className='chapters-stage'>
        <div className='chapters-wrap'>
          <div className='chapters-text'>
            <h2 id='chapters-title'>Comment une ref entre dans l’archive.</h2>
            <ol className='chapters-steps'>
              {points.map((point, i) => (
                <li
                  key={point.index}
                  className={`chapters-step ${live && i === active ? 'is-on' : ''}`}
                >
                  <p className='chapters-step-index'>{point.index}</p>
                  <h3>{point.title}</h3>
                  <p className='chapters-step-text'>
                    <span>{point.text}</span>
                  </p>
                  {/* Au repos, chaque point garde sa ref sous la main. */}
                  {!live && (
                    <RefVideo
                      className='chapters-step-video'
                      tenorId={point.tenorId}
                      refName={point.refName}
                      shouldPlay={false}
                    />
                  )}
                </li>
              ))}
            </ol>
            <div className='chapters-actions'>
              <Link href='/add' className='cta-btn cta-btn--secondary'>
                Ajouter une ref
              </Link>
            </div>
          </div>

          {/* En direct : un seul cadre, les refs y passent en fondu. */}
          {live && (
            <div className='chapters-frame'>
              {points.map((point, i) => (
                <div
                  key={point.index}
                  className={`chapters-frame-item ${i === active ? 'is-on' : ''} ${i < active ? 'is-past' : ''}`}
                  inert={i !== active}
                >
                  <RefVideo
                    tenorId={point.tenorId}
                    refName={point.refName}
                    shouldPlay={inView && i === active}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
