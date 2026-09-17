'use client'

import { useRef, type RefObject } from 'react'
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

  return (
    <div
      className={cn(
        'relative aspect-[9/16] w-full max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-2xl overflow-hidden rounded-3xl bg-black shadow-xl backdrop-blur-md',
        className,
      )}
    >
      {/* Video */}
      <ReactPlayer
        ref={playerRef}
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
        loop
        controls
        width='100%'
        height='100%'
        className='!absolute !top-0 !left-0 z-0'
      />
    </div>
  )
}
