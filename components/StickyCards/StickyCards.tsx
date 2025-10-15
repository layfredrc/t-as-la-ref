'use client'
import './StickyCards.css'

import { useRef } from 'react'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import AnimatedCopy from '../AnimatedCopy'

gsap.registerPlugin(ScrollTrigger)

const StickyCards = () => {
  const stickyCardsData = [
    {
      index: '01',
      title: 'Le monde bouge (vite)',
      image: 'images/services-header/cover.png',
      description:
        'Chaque jour, TikTok efface hier. Chaque semaine, une nouvelle vanne devient culte. Chaque mois, un nouveau dialecte voit le jour. Le langage des références, c’est la bande-son de notre génération Ça fait rire, ça exclut, ça connecte. Mais ce langage…personne ne l’archive.',
    },
    {
      index: '02',
      title: 'Une culture vivante, mais volatile',
      image: 'images/services/service-2.png',
      description:
        'Les références, c’est pas juste du lol. C’est de la mémoire, du contexte, de l’identité.Un punchline, c’est un repère. Une scène culte, c’est une émotion commune. Comprendre une ref, c’est appartenir à la conversation.',
    },
    {
      index: '03',
      title: 'Notre mission : tout documenter, ensemble',
      image: 'images/services/service-3.png',
      description:
        'On en avait marre de voir les réfs disparaître. Marre que ce savoir se perde dans le scroll. On veut créer la première bibliothèque vivante Une encyclopédie du chaos culturel. Mais surtout : un outil communautaire',
    },
    {
      index: '04',
      title: 'Une plateforme pour comprendre — pas juger',
      image: 'images/services/service-4.png',
      description:
        'Chez nous, pas de gatekeeping. Que tu sois boomer, daron, ou gen Z, que tu connaisses toutes les réfs ou aucune, T’as le droit de dire : “J’ai pas la ref.” Et ici, tu peux l’apprendre.',
    },
  ]

  const container = useRef(null)

  useGSAP(
    () => {
      const stickyCards = document.querySelectorAll('.sticky-card')

      stickyCards.forEach((card, index) => {
        if (index < stickyCards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            endTrigger: stickyCards[stickyCards.length - 1],
            end: 'top top',
            pin: true,
            pinSpacing: false,
          })
        }

        if (index < stickyCards.length - 1) {
          ScrollTrigger.create({
            trigger: stickyCards[index + 1],
            start: 'top bottom',
            end: 'top top',
            onUpdate: (self) => {
              const progress = self.progress
              const scale = 1 - progress * 0.25
              const rotation = (index % 2 === 0 ? 5 : -5) * progress
              const afterOpacity = progress

              gsap.set(card, {
                scale: scale,
                rotation: rotation,
                '--after-opacity': afterOpacity,
              })
            },
          })
        }
      })
    },
    { scope: container },
  )

  return (
    <div className='sticky-cards' ref={container}>
      {stickyCardsData.map((cardData, index) => (
        <div className='sticky-card' key={index}>
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
                <img src={cardData.image} alt='' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StickyCards
