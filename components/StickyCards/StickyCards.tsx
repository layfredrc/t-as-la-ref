'use client'
import './StickyCards.css'

import { useRef } from 'react'
import Image from 'next/image'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import AnimatedCopy from '../AnimatedCopy'

gsap.registerPlugin(ScrollTrigger)

const stickyCardsData = [
  {
    index: '01',
    title: 'Le monde bouge (vite)',
    image: '/images/home/manifeste-01.webp',
    description:
      'Chaque jour, TikTok efface hier. Chaque semaine, une nouvelle vanne devient culte. Chaque mois, un nouveau dialecte voit le jour. Le langage des références, c’est la bande-son de notre génération. Ça fait rire, ça exclut, ça connecte. Mais ce langage… personne ne l’archive.',
  },
  {
    index: '02',
    title: 'Une culture vivante, mais volatile',
    image: '/images/home/manifeste-02.webp',
    description:
      'Les références, c’est pas juste du lol. C’est de la mémoire, du contexte, de l’identité. Une punchline, c’est un repère. Une scène culte, c’est une émotion commune. Comprendre une ref, c’est appartenir à la conversation.',
  },
  {
    index: '03',
    title: 'Notre mission : tout documenter, ensemble',
    image: '/images/home/manifeste-03.webp',
    description:
      'On en avait marre de voir les refs disparaître. Marre que ce savoir se perde dans le scroll. On veut créer la première bibliothèque vivante. Une encyclopédie du chaos culturel. Mais surtout : un outil communautaire.',
  },
  {
    index: '04',
    title: 'Une plateforme pour comprendre — pas juger',
    image: '/images/home/manifeste-04.webp',
    description:
      'Chez nous, pas de gatekeeping. Que tu sois boomer, daron, ou gen Z, que tu connaisses toutes les refs ou aucune, t’as le droit de dire : “J’ai pas la ref.” Et ici, tu peux l’apprendre.',
  },
]

/**
 * Le manifeste, en cartes empilées.
 *
 * Sur grand écran, chaque carte est épinglée le temps que la suivante la
 * recouvre, en se réduisant et en s'assombrissant. Sur téléphone, on n'épingle
 * plus : les cartes faisaient 100svh de haut avec un contenu (index, titre
 * sur quatre lignes, paragraphe, image) qui dépassait largement — la fin de
 * chaque carte était tronquée, puis recouverte. Elles défilent maintenant
 * normalement, à leur hauteur naturelle. `gsap.matchMedia` recrée ou détruit
 * les triggers quand la fenêtre change de côté.
 */
const StickyCards = () => {
  const container = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1001px)', () => {
        const stickyCards = gsap.utils.toArray<HTMLElement>('.sticky-card', container.current)
        const last = stickyCards[stickyCards.length - 1]

        stickyCards.forEach((card, index) => {
          if (index === stickyCards.length - 1) return

          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: last,
            end: 'top top',
            pin: true,
            pinSpacing: false,
          })

          ScrollTrigger.create({
            trigger: stickyCards[index + 1],
            start: 'top bottom',
            end: 'top top',
            onUpdate: (self) => {
              const progress = self.progress
              gsap.set(card, {
                scale: 1 - progress * 0.25,
                rotation: (index % 2 === 0 ? 5 : -5) * progress,
                '--after-opacity': progress,
              })
            },
          })
        })
      })

      return () => mm.revert()
    },
    { scope: container },
  )

  return (
    <div className='sticky-cards' ref={container}>
      {stickyCardsData.map((cardData) => (
        <div className='sticky-card' key={cardData.index}>
          <div className='sticky-card-index'>
            <h1>{cardData.index}</h1>
          </div>
          <div className='sticky-card-content'>
            <div className='sticky-card-content-wrapper'>
              <h1 className='sticky-card-header'>{cardData.title}</h1>

              <div className='sticky-card-copy'>
                <div className='sticky-card-copy-title'>
                  <p>(Manifeste)</p>
                </div>
                <div className='sticky-card-copy-description'>
                  <AnimatedCopy colorFinal='#FFFFFF' colorAccent='#b6a6fe' colorInitial='#5d576b'>
                    <p>{cardData.description}</p>
                  </AnimatedCopy>
                </div>
              </div>

              <div className='sticky-card-img'>
                {/* Optimisée par Next (WebP retaillé selon `sizes`) : sur
                    mobile l'image fait toute la largeur, sur desktop un tiers. */}
                <Image
                  src={cardData.image}
                  alt=''
                  width={1200}
                  height={800}
                  sizes='(max-width: 1000px) 100vw, 33vw'
                  loading='lazy'
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StickyCards
