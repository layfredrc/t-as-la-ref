'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'
import ReactPlayer from 'react-player'
import type { Config } from 'react-player/types'
import 'youtube-video-element'
import 'tiktok-video-element'
import { cn } from '@/lib/utils'

/**
 * Le seul moyen d'obtenir `mute=1` dans l'URL de l'iframe. La propriété
 * `muted` que react-player transmet à l'élément ne pose pas l'attribut : son
 * setter appelle `mute()` / `unMute()` sur l'API, une fois le lecteur chargé.
 * Or l'URL est construite au montage — sans `mute` dedans, `autoplay=1` est
 * refusé par la politique d'autoplay et la vidéo ne démarre jamais.
 *
 * Défini hors du composant : passé en littéral, l'objet changerait d'identité
 * à chaque rendu et react-player le réappliquerait à l'élément.
 *
 * Le cast est volontaire. `Config` ne déclare qu'une poignée des paramètres
 * acceptés, alors qu'à l'exécution la config est recopiée telle quelle dans la
 * query string de l'iframe — `mute` et `muted` en font partie sans y être
 * typés. Vérifié sur le rendu : l'URL de l'iframe porte bien `mute=1`.
 */
const MUTED_AUTOPLAY_CONFIG = {
  youtube: { mute: 1 },
  tiktok: { muted: 1 },
} as unknown as Config

/** Surface de l'API du lecteur, exposée par le web component YouTube. */
type PlayerApi = {
  mute?: () => void
  unMute?: () => void
  setVolume?: (value: number) => void
}

type MediaElement = HTMLVideoElement & {
  api?: PlayerApi | null
  /** Résolue quand le lecteur est prêt — c'est là que `api` existe enfin. */
  loadComplete?: Promise<unknown>
}

type ShortsPlayerProps = {
  url: string
  playing?: boolean
  /**
   * Démarrage muet. C'est la seule lecture qu'un navigateur mobile autorise
   * sans geste utilisateur : `react-player` applique `playing` depuis un
   * effet, jamais depuis le handler d'un tap, et un iframe cross-origin
   * n'hérite pas de l'activation utilisateur de la page. Son muet, la
   * politique d'autoplay laisse passer — c'est ce que font TikTok, Reels et
   * Shorts sur le web.
   */
  muted?: boolean
  username?: string
  title?: string
  music?: string
  className?: string
  /**
   * Accès direct à l'élément média, pour le play/pause piloté par la
   * RefCard (voir sa couche de tap).
   */
  playerRef?: RefObject<HTMLVideoElement | null>
}

export const VideoPlayer = ({
  url,
  playing: externalPlaying = false,
  muted = false,
  className,
  playerRef,
}: ShortsPlayerProps) => {
  /**
   * L'URL de l'iframe n'est construite qu'une fois, au montage : `autoplay` et
   * `mute` doivent y être à ce moment-là. On gèle donc la décision sur
   * l'intention du montage plutôt que sur l'état courant — sinon mettre la
   * vidéo en pause, ou activer le son, changerait l'URL et rechargerait la
   * lecture depuis le début.
   *
   * Le démarrage est donc toujours muet, y compris si l'utilisateur a déjà
   * demandé le son ailleurs dans le feed : la prop `muted` prend le relais
   * juste après, via l'API du lecteur, sans toucher à l'iframe.
   */
  const autoPlayIntent = useRef(externalPlaying)

  const nodeRef = useRef<MediaElement | null>(null)

  /**
   * Rattrapage du `mute` dans l'URL de l'iframe.
   *
   * `tiktok-video-element` construit cette URL avant que react-player n'ait
   * posé `config`. Pour la première ref affichée ça passe — l'élément est
   * encore en attente d'upgrade quand React écrit ses propriétés — mais pas
   * pour celles montées ensuite, au fil des swipes : leur URL part sans
   * `muted`, et sans lui la politique d'autoplay refuse la lecture.
   *
   * L'attribut est le seul que leur sérialisation relise, mais le poser ne
   * reconstruit rien : il faut redemander un `load()`. Reporté d'un tour,
   * parce que `load()` est ignoré tant qu'un chargement est déjà en vol —
   * ce qui est le cas juste après l'insertion. Sans ce report le rattrapage
   * passait parfois à la trappe : TikTok tantôt muet, tantôt non.
   */
  const attachPlayer = useCallback(
    (node: MediaElement | null) => {
      nodeRef.current = node
      if (playerRef) playerRef.current = node
      if (!node || !autoPlayIntent.current) return

      node.toggleAttribute('muted', true)
      setTimeout(() => {
        if (nodeRef.current !== node) return
        const src = node.shadowRoot?.querySelector('iframe')?.getAttribute('src')
        if (src && !/[?&]mute(d)?=1(&|$)/.test(src)) node.load()
      }, 0)
    },
    [playerRef],
  )

  /**
   * Ré-affirme l'état du son directement sur le lecteur.
   *
   * `youtube-video-element` compare l'état demandé à ce que lui répond l'API
   * avant d'agir (`if (this.muted == val) return`, où le getter appelle
   * `api.isMuted()`). Au démarrage cette réponse n'est pas fiable : la vidéo
   * peut partir avec le son malgré `mute=1` dans l'URL — d'où des premières
   * bribes audibles — et surtout le bouton son devient sans effet, le setter
   * estimant qu'il n'y a rien à faire. On passe donc par l'API quand elle est
   * là. `tiktok-video-element` n'a pas ce garde-fou : la propriété suffit.
   */
  const applyMuted = useCallback(() => {
    const node = nodeRef.current
    if (!node) return

    const applique = () => {
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

    // Tout de suite : quand l'appel vient d'un appui, le geste est encore
    // « actif » aux yeux du navigateur, ce dont dépend l'activation du son.
    applique()

    // Y a-t-il encore quelque chose à attendre ? Seuls les lecteurs qui
    // exposent une API en ont une à attendre (`api` est déclaré, à null, dès
    // la construction de l'élément YouTube). TikTok n'en expose pas : la
    // propriété a déjà fait son effet, il n'y a rien à réessayer. Sans cette
    // distinction la boucle ci-dessous tournait indéfiniment et renvoyait un
    // `unMute` toutes les 150 ms au lecteur — le son hachait.
    return !('api' in node) || Boolean(node.api?.mute)
  }, [muted])

  /**
   * Au montage, l'API du lecteur n'existe pas encore : le premier passage ne
   * fait rien d'utile. On réessaie brièvement plutôt que de s'accrocher à la
   * promesse `loadComplete` de l'élément, qu'il remplace dès qu'il se
   * recharge — on resterait sur un signal mort.
   */
  useEffect(() => {
    if (applyMuted()) return

    const debut = Date.now()
    const timer = setInterval(() => {
      if (applyMuted() || Date.now() - debut > 5000) clearInterval(timer)
    }, 150)
    return () => clearInterval(timer)
  }, [applyMuted])

  return (
    <div
      className={cn(
        'relative aspect-[9/16] w-full max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-2xl overflow-hidden rounded-3xl bg-black shadow-xl backdrop-blur-md',
        className,
      )}
    >
      {/* Video */}
      <ReactPlayer
        ref={attachPlayer}
        src={url}
        playing={externalPlaying}
        muted={muted}
        // L'embed démarre de lui-même, sans dépendre du `.play()` que
        // react-player déclenche depuis un effet — un effet n'est pas un geste
        // utilisateur, et la lecture était refusée. Seuls les appelants qui
        // demandent la lecture l'obtiennent : la page /ref et la preview du
        // formulaire ne passent pas `playing`, et gardent leur son.
        autoPlay={autoPlayIntent.current}
        config={autoPlayIntent.current ? MUTED_AUTOPLAY_CONFIG : undefined}
        // Sans ça, iOS passe la vidéo en plein écran au lieu de la jouer
        // dans la carte.
        playsInline
        onPlay={applyMuted}
        loop
        controls
        width='100%'
        height='100%'
        className='!absolute !top-0 !left-0 z-0'
      />
    </div>
  )
}
