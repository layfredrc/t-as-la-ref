'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const VARS = ['--page-bg', '--m-ink', '--m-accent'] as const

/**
 * La bascule au noir : en entrant dans le manifeste, toute la page passe du
 * fond clair au noir, l'encre s'inverse et l'accent passe du violet sombre
 * au lavande. Elle reste noire jusqu'au vortex (déjà sombre), et redevient
 * claire en remontant vers le hero : la transition suit le scroll dans les
 * deux sens.
 *
 * Trois variables sur <html> : `--page-bg` (le fond du body, voir
 * globals.css), `--m-ink` et `--m-accent` (les couleurs du manifeste). Les
 * valeurs viennent des tokens du thème, lus dans le CSS : aucune couleur
 * n'est écrite ici. Retirées au démontage : les autres pages gardent leur
 * fond.
 */
export default function ManifestNight() {
  useGSAP(() => {
    const root = document.documentElement
    const css = getComputedStyle(root)
    const token = (name: string) => css.getPropertyValue(name).trim()

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.statement',
        // Du moment où la déclaration monte dans le bas de l'écran à celui
        // où elle en atteint le haut : la page a fini de basculer avant
        // qu'on lise le titre.
        start: 'top 85%',
        end: 'top 25%',
        scrub: 0.6,
      },
    })

    // Le fond fond du clair au noir sur toute la course.
    tl.fromTo(
      root,
      { '--page-bg': token('--bg') },
      { '--page-bg': token('--fg'), ease: 'none', duration: 1 },
      0,
    )
    // L'encre, elle, s'inverse d'un coup à mi-course. En fondu, elle
    // croisait le fond au même gris pile au milieu : le titre disparaissait
    // un instant. D'un coup, le texte reste lisible tout du long (noir sur
    // fond qui fonce, puis clair sur fond déjà sombre).
    tl.fromTo(
      root,
      { '--m-ink': token('--fg'), '--m-accent': token('--accent4') },
      { '--m-ink': token('--bg'), '--m-accent': token('--accent5'), duration: 0.02 },
      0.49,
    )

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      VARS.forEach((name) => root.style.removeProperty(name))
    }
  })

  return null
}
