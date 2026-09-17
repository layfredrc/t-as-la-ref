'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import ReactPlayer from 'react-player'
import type { Config } from 'react-player/types'
import 'youtube-video-element'
import 'tiktok-video-element'
import type { MediaType } from '@/lib/types'
import { applyMutedTo, pilotableParApi, type MediaElement } from '@/lib/utils/playerSound'
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

/**
 * La même chose, sans le son coupé.
 *
 * Réservée au remontage déclenché par le bouton son (voir `soundGeneration`) :
 * le clic vient d'avoir lieu, l'activation utilisateur est encore valide, et
 * la politique d'autoplay laisse donc passer une lecture sonore.
 */
const SOUND_AUTOPLAY_CONFIG = {
  youtube: { mute: 0 },
  tiktok: { muted: 0 },
} as unknown as Config

type ShortsPlayerProps = {
  url: string
  /** Sert à décider si le son se pilote par l'API ou par un remontage. */
  mediaType?: MediaType
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
  /**
   * Barre de contrôle du lecteur. Le feed la coupe (`false`) : il recouvre
   * l'embed pour capter le swipe, donc ces contrôles seraient de toute façon
   * hors d'atteinte — et celui de TikTok, quand on l'atteint, redirige vers
   * tiktok.com. Les deux web components traduisent l'absence d'attribut par
   * `controls=0` dans l'URL de l'iframe : la barre ne s'affiche même pas.
   */
  controls?: boolean
  username?: string
  title?: string
  music?: string
  className?: string
  /**
   * Accès direct à l'élément média, pour le play/pause et le son pilotés par
   * la RefCard (voir sa couche de tap et son bouton son).
   */
  playerRef?: RefObject<HTMLVideoElement | null>
}

export const VideoPlayer = ({
  url,
  mediaType,
  playing: externalPlaying = false,
  muted = false,
  controls = true,
  className,
  playerRef,
}: ShortsPlayerProps) => {
  /**
   * L'URL de l'iframe n'est construite qu'une fois, au montage : `autoplay` et
   * `mute` doivent y être à ce moment-là. On gèle donc la décision sur
   * l'intention du montage plutôt que sur l'état courant — sinon mettre la
   * vidéo en pause changerait l'URL et rechargerait la lecture depuis le
   * début.
   */
  const autoPlayIntent = useRef(externalPlaying)

  const nodeRef = useRef<MediaElement | null>(null)

  /**
   * Génération de l'iframe, pour les lecteurs dont l'API ignore le son.
   *
   * TikTok ne répond pas à un `unMute` venu de la page : son web component
   * poste bien le message, le player ne l'applique pas. Le seul levier qui
   * reste est l'URL de l'iframe, lue au montage — donc reconstruire l'élément.
   * Le compteur entre dans la `key` de `ReactPlayer` : l'incrémenter remplace
   * l'iframe par une neuve, en autoplay sonore.
   *
   * Contrepartie assumée : la vidéo repart du début. Une seule fois, au
   * premier passage au son — les bascules suivantes ne changent plus la
   * génération, puisqu'elle mémorise ce qui a déjà été monté.
   */
  const [soundGeneration, setSoundGeneration] = useState(0)
  /** État du son gravé dans l'URL de l'iframe actuellement montée. */
  const mountedMuted = useRef(true)

  useEffect(() => {
    if (pilotableParApi(mediaType)) return
    if (muted === mountedMuted.current) return
    // Seul le passage au son justifie de tout reconstruire : re-couper le son
    // marche très bien par message, et ça éviterait de redémarrer la vidéo
    // deux fois. On note quand même l'état pour ne pas remonter en boucle.
    mountedMuted.current = muted
    if (!muted) setSoundGeneration((n) => n + 1)
  }, [muted, mediaType])

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
   * ce qui est le cas juste après l'insertion.
   */
  const attachPlayer = useCallback(
    (node: MediaElement | null) => {
      nodeRef.current = node
      if (playerRef) playerRef.current = node
      if (!node || !autoPlayIntent.current || !mountedMuted.current) return

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
   * Ré-affirme l'état du son sur le lecteur. La logique vit dans
   * `lib/utils/playerSound` : le bouton son de la RefCard doit pouvoir donner
   * le même ordre lui-même, synchronement dans le handler de son clic.
   */
  const applyMuted = useCallback(() => applyMutedTo(nodeRef.current, muted), [muted])

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

  // Une iframe montée pour le son ne repasse pas par le démarrage muet.
  const sonAuMontage = soundGeneration > 0
  const enAutoplay = autoPlayIntent.current || sonAuMontage

  return (
    <div
      className={cn(
        'relative aspect-[9/16] w-full max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-md 2xl:max-w-2xl overflow-hidden rounded-3xl bg-black shadow-xl backdrop-blur-md',
        className,
      )}
    >
      {/* Video */}
      <ReactPlayer
        // Remonter l'élément est le seul moyen de changer l'URL de l'iframe,
        // donc le seul moyen d'obtenir le son sur un lecteur qui ignore l'API.
        key={soundGeneration}
        ref={attachPlayer}
        src={url}
        playing={externalPlaying}
        muted={muted}
        // L'embed démarre de lui-même, sans dépendre du `.play()` que
        // react-player déclenche depuis un effet — un effet n'est pas un geste
        // utilisateur, et la lecture était refusée. Seuls les appelants qui
        // demandent la lecture l'obtiennent : la page /ref et la preview du
        // formulaire ne passent pas `playing`, et gardent leur son.
        autoPlay={enAutoplay}
        config={
          enAutoplay ? (sonAuMontage ? SOUND_AUTOPLAY_CONFIG : MUTED_AUTOPLAY_CONFIG) : undefined
        }
        controls={controls}
        // Sans ça, iOS passe la vidéo en plein écran au lieu de la jouer
        // dans la carte.
        playsInline
        onPlay={applyMuted}
        loop
        width='100%'
        height='100%'
        className='!absolute !top-0 !left-0 z-0'
      />
    </div>
  )
}
