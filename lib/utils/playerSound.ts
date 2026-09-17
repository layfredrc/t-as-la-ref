import type { MediaType } from '@/lib/types'

/**
 * Le son des embeds, côté page.
 *
 * Le feed recouvre entièrement l'iframe du lecteur : ses propres contrôles
 * sont donc hors d'atteinte, et c'est nous qui pilotons le son. Toute la
 * logique est ici plutôt que dans `VideoPlayer`, parce que le bouton de la
 * `RefCard` doit pouvoir donner l'ordre lui-même, synchronement dans le
 * handler du clic — c'est ce qui rend l'activation utilisateur encore valide
 * au moment où le navigateur décide d'autoriser le son.
 */

/** Surface de l'API du lecteur, exposée par le web component YouTube. */
type PlayerApi = {
  mute?: () => void
  unMute?: () => void
  setVolume?: (value: number) => void
}

export type MediaElement = HTMLVideoElement & {
  api?: PlayerApi | null
  /** Vrai une fois le lecteur prêt — avant ça, `muted` ne dit rien d'utile. */
  readonly isLoaded?: boolean
}

/**
 * Plateformes dont l'API n'est pas garantie de répondre aux ordres venus de la
 * page. Pour elles, et **seulement si l'état observé refuse de suivre**, le
 * dernier levier est de reconstruire l'iframe avec l'autoplay sonore (voir
 * `VideoPlayer`).
 *
 * TikTok y figure par prudence, pas par constat. Une session précédente avait
 * conclu qu'il « ne répond pas à `unMute` venu du parent » ; vérifié depuis sur
 * appareil, c'est faux — il répond, et le remontage ne se déclenche jamais. Le
 * vrai coupable était l'ordre perdu avant que le lecteur ne soit prêt, que
 * `sonObserve` rattrape maintenant. On garde le repli parce qu'il ne coûte rien
 * tant que tout va bien et qu'il reste le seul chemin de secours si un
 * navigateur refuse l'ordre — les règles d'activation utilisateur ne sont pas
 * les mêmes partout. Retirer l'entrée supprime le mécanisme.
 */
export const PLATEFORMES_SANS_API_SON: readonly MediaType[] = ['tiktok']

export function pilotableParApi(mediaType?: MediaType): boolean {
  return !mediaType || !PLATEFORMES_SANS_API_SON.includes(mediaType)
}

/**
 * Donne l'ordre au lecteur.
 *
 * `youtube-video-element` compare l'état demandé à ce que lui répond l'API
 * avant d'agir (`if (this.muted == val) return`, où le getter appelle
 * `api.isMuted()`). Au démarrage cette réponse n'est pas fiable, et le setter
 * conclut qu'il n'y a rien à faire — le bouton son devenait sans effet. On
 * passe donc par l'API dès qu'elle est là. `tiktok-video-element` n'a pas ce
 * garde-fou : la propriété suffit à poster le message.
 *
 * Donner l'ordre n'est pas la même chose que l'obtenir : voir `sonObserve`.
 */
export function commanderSon(node: MediaElement | null, muted: boolean): void {
  if (!node) return

  const api = node.api
  if (api?.mute && api?.unMute) {
    if (muted) {
      api.mute()
    } else {
      api.unMute()
      api.setVolume?.(100)
    }
    return
  }

  node.muted = muted
}

/**
 * État du son réellement rapporté par le lecteur, ou `null` tant qu'on ne peut
 * pas s'y fier.
 *
 * C'est la pièce qui manquait : on commandait le son sans jamais vérifier
 * qu'il avait suivi. D'où un son « irrégulier » — un ordre parti trop tôt,
 * avant que le lecteur ne finisse de s'initialiser, est silencieusement perdu,
 * et rien ne le rattrapait.
 *
 * Les deux lecteurs savent répondre, mais pas tout de suite :
 *
 * - YouTube : `muted` interroge `api.isMuted()` **une fois chargé** ; avant ça
 *   il renvoie l'attribut, c'est-à-dire ce qu'on a écrit nous-mêmes. Sans
 *   `isLoaded`, on se contenterait de lire son propre écho.
 * - TikTok : `muted` renvoie un champ interne initialisé à `false` et mis à
 *   jour par les messages `onMute` du player. Avant le premier de ces
 *   messages, il annonce donc « son actif » alors que l'iframe démarre muette.
 *   D'où `sonRapporte`, que `VideoPlayer` lève au premier `volumechange`.
 */
export function sonObserve(
  node: MediaElement | null,
  { sonRapporte }: { sonRapporte: boolean },
): boolean | null {
  if (!node) return null
  if ('api' in node) return node.isLoaded ? Boolean(node.muted) : null
  return sonRapporte ? Boolean(node.muted) : null
}
