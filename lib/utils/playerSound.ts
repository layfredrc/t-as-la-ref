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
}

/**
 * Plateformes dont l'API ne répond pas aux ordres venus de la page.
 *
 * TikTok en fait partie : `unMute` envoyé depuis le parent reste sans effet
 * (constaté sur appareil). Pour elles, le seul moyen sûr d'obtenir le son est
 * de reconstruire l'iframe avec l'autoplay sonore, dans la foulée du clic —
 * voir `VideoPlayer`. Si TikTok se met à répondre, retirer l'entrée suffit.
 */
export const PLATEFORMES_SANS_API_SON: readonly MediaType[] = ['tiktok']

export function pilotableParApi(mediaType?: MediaType): boolean {
  return !mediaType || !PLATEFORMES_SANS_API_SON.includes(mediaType)
}

/**
 * Applique l'état du son à l'élément média.
 *
 * `youtube-video-element` compare l'état demandé à ce que lui répond l'API
 * avant d'agir (`if (this.muted == val) return`, où le getter appelle
 * `api.isMuted()`). Au démarrage cette réponse n'est pas fiable : la vidéo
 * peut partir avec le son malgré `mute=1` dans l'URL, et surtout le bouton
 * son devient sans effet, le setter estimant qu'il n'y a rien à faire. On
 * passe donc par l'API dès qu'elle est là. `tiktok-video-element` n'a pas ce
 * garde-fou : la propriété suffit.
 *
 * @returns `true` quand l'ordre a pu être donné pour de bon — il n'y a plus
 * rien à réessayer. `false` quand l'élément déclare une API mais ne l'a pas
 * encore construite : l'appelant doit repasser.
 */
export function applyMutedTo(node: MediaElement | null, muted: boolean): boolean {
  if (!node) return false

  const api = node.api
  if (api?.mute && api?.unMute) {
    if (muted) {
      api.mute()
    } else {
      api.unMute()
      api.setVolume?.(100)
    }
    return true
  }

  node.muted = muted

  // Y a-t-il encore quelque chose à attendre ? Seuls les lecteurs qui exposent
  // une API en ont une à attendre (`api` est déclaré, à null, dès la
  // construction de l'élément YouTube). TikTok n'en expose pas : la propriété
  // a déjà fait son effet, il n'y a rien à réessayer. Sans cette distinction
  // la boucle de rattrapage tournait indéfiniment et renvoyait un `unMute`
  // toutes les 150 ms au lecteur — le son hachait.
  return !('api' in node)
}
