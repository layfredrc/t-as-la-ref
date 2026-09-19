'use client'
import React, { type ReactElement, type ReactNode, type Ref, useRef } from 'react'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText)

type AnimatedCopyProps = {
  children: ReactNode
  colorInitial?: string
  colorAccent?: string
  colorFinal?: string
}

type Split = { wordSplit: SplitText; charSplit: SplitText }

/** Délai avant qu'un caractère passe de la couleur d'accent à sa couleur finale. */
const ACCENT_MS = 100

/**
 * Texte qui se colore caractère par caractère au fil du scroll.
 *
 * L'ancienne version repassait sur TOUS les caractères à chaque tick de
 * ScrollTrigger (un `gsap.set` par caractère, ~250 par paragraphe, quatre
 * paragraphes sur la home) : plusieurs milliers d'écritures de style par
 * image pendant le scroll, ce qui saccadait sur mobile. Ici on ne touche que
 * les caractères dont l'état a changé depuis le tick précédent.
 */
export default function AnimatedCopy({
  children,
  colorInitial = '#dddddd',
  colorAccent = '#abff02',
  colorFinal = '#000000',
}: AnimatedCopyProps) {
  const containerRef = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const container = containerRef.current
      if (!container) return

      const elements: Element[] = container.hasAttribute('data-copy-wrapper')
        ? Array.from(container.children)
        : [container]

      const splits: Split[] = elements.map((element) => {
        const wordSplit = SplitText.create(element, { type: 'words', wordsClass: 'word' })
        const charSplit = SplitText.create(wordSplit.words, { type: 'chars', charsClass: 'char' })
        return { wordSplit, charSplit }
      })

      const chars = splits.flatMap(({ charSplit }) => charSplit.chars)
      const timers = new Map<number, number>()
      const completed = new Set<number>()
      // Index du dernier caractère « atteint » au tick précédent.
      let reached = -1

      gsap.set(chars, { color: colorInitial })

      const scheduleFinal = (index: number) => {
        const existing = timers.get(index)
        if (existing) window.clearTimeout(existing)
        timers.set(
          index,
          window.setTimeout(() => {
            timers.delete(index)
            if (completed.has(index)) return
            gsap.to(chars[index], {
              duration: 0.1,
              ease: 'none',
              color: colorFinal,
              onComplete: () => {
                completed.add(index)
              },
            })
          }, ACCENT_MS),
        )
      }

      const reset = (index: number) => {
        const existing = timers.get(index)
        if (existing) {
          window.clearTimeout(existing)
          timers.delete(index)
        }
        completed.delete(index)
        // Un tween vers la couleur finale peut être en cours : sans ça il
        // finirait après le reset et remettrait le caractère dans `completed`.
        gsap.killTweensOf(chars[index])
        gsap.set(chars[index], { color: colorInitial })
      }

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top 90%',
        end: 'top 10%',
        scrub: 1,
        onUpdate: (self) => {
          const target = Math.min(chars.length - 1, Math.floor(self.progress * chars.length))
          if (target === reached) return

          if (target > reached) {
            for (let i = reached + 1; i <= target; i++) {
              if (completed.has(i) || timers.has(i)) continue
              gsap.set(chars[i], { color: colorAccent })
              scheduleFinal(i)
            }
          } else {
            for (let i = reached; i > target; i--) reset(i)
          }

          reached = target
        },
      })

      return () => {
        trigger.kill()
        timers.forEach((timer) => window.clearTimeout(timer))
        timers.clear()
        splits.forEach(({ wordSplit, charSplit }) => {
          charSplit.revert()
          wordSplit.revert()
        })
      }
    },
    { scope: containerRef, dependencies: [colorInitial, colorAccent, colorFinal] },
  )

  if (React.isValidElement(children) && React.Children.count(children) === 1) {
    return React.cloneElement(children as ReactElement<{ ref?: Ref<HTMLElement> }>, {
      ref: containerRef,
    })
  }

  return (
    <div ref={containerRef as Ref<HTMLDivElement>} data-copy-wrapper='true'>
      {children}
    </div>
  )
}
