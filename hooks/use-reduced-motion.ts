import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/**
 * Le réglage système « réduire les animations ».
 *
 * `false` au rendu serveur : la page part animée, puis se calme dès
 * l'hydratation si le visiteur l'a demandé. Les animations GSAP, elles,
 * passent par `gsap.matchMedia` et ne démarrent jamais dans ce cas.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
