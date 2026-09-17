'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import ReactPlayer from 'react-player'
import type { Config } from 'react-player/types'
import 'youtube-video-element'
import 'tiktok-video-element'
import type { MediaType } from '@/lib/types'
import {
  commanderSon,
  pilotableParApi,
  sonObserve,
  type MediaElement,
} from '@/lib/utils/playerSound'
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
   * Génération de l'iframe, dernier recours quand le lecteur refuse l'ordre.
   *
   * L'état du son ne se change normalement pas en rechargeant quoi que ce
   * soit : on commande le lecteur, il obéit. Mais TikTok ignore parfois
   * `unMute` venu de la page, et le seul levier qui reste est alors l'URL de
   * l'iframe, lue au montage. Le compteur entre dans la `key` de
   * `ReactPlayer` : l'incrémenter remplace l'iframe par une neuve, en autoplay
   * sonore.
   *
   * Contrepartie : la vidéo repart du début. C'est pour ça que ce n'est plus
   * systématique — la version précédente remontait l'iframe dès qu'une ref
   * TikTok s'affichait avec le son actif, soit un rechargement visible à
   * chaque swipe. On n'y vient plus qu'après avoir constaté, pendant une
   * fenêtre de grâce, que l'ordre n'a pas été suivi.
   */
  const [soundGeneration, setSoundGeneration] = useState(0)
  const remontageFait = useRef(false)

  /**
   * Le lecteur a-t-il déjà parlé de son son ?
   *
   * TikTok initialise son `muted` interne à `false` et ne le corrige qu'au
   * premier message `onMute`. Tant qu'il n'a rien dit, le lire reviendrait à
   * croire que le son est actif alors que l'iframe démarre muette.
   */
  const sonRapporte = useRef(false)

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
      sonRapporte.current = false
      if (!node || !autoPlayIntent.current || remontageFait.current) return

      node.toggleAttribute('muted', true)
      setTimeout(() => {
        if (nodeRef.current !== node) return
        const src = node.shadowRoot?.querySelector('iframe')?.getAttribute('src')
        if (src && !/[?&]mute(d)?=1(&|$)/.test(src)) node.load()
      }, 0)
    },
    [playerRef],
  )

  /** Ré-affirme l'état du son. Appelé aussi quand la lecture (re)démarre. */
  const commande = useCallback(() => commanderSon(nodeRef.current, muted), [muted])

  /**
   * Converger sur l'état **observé**, pas sur l'ordre donné.
   *
   * Un ordre parti avant que le lecteur ne soit prêt est perdu sans bruit :
   * c'est la source de l'irrégularité du son. On redemande donc jusqu'à ce que
   * le lecteur rapporte le bon état, et on ne s'arrête que là.
   */
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const marqueRapport = () => {
      sonRapporte.current = true
    }
    node.addEventListener('volumechange', marqueRapport)

    let converge = false
    const verifie = () => {
      const observe = sonObserve(nodeRef.current, { sonRapporte: sonRapporte.current })
      if (observe === muted) converge = true
      return converge
    }

    // Tout de suite : quand l'appel vient d'un appui, le geste est encore
    // « actif » aux yeux du navigateur, ce dont dépend l'activation du son.
    commande()

    const insiste = setInterval(() => {
      if (verifie()) {
        clearInterval(insiste)
        return
      }
      commande()
    }, 200)

    /**
     * Fenêtre de grâce. Passé ce délai sans que le lecteur ait suivi, c'est
     * qu'il n'écoute pas — et pour les plateformes connues pour ça, il ne
     * reste que l'URL de l'iframe. Seulement pour activer le son : le couper
     * ne vaut jamais un rechargement.
     */
    const repli = setTimeout(() => {
      clearInterval(insiste)
      if (verifie() || muted) return
      if (pilotableParApi(mediaType) || remontageFait.current) return
      remontageFait.current = true
      setSoundGeneration((n) => n + 1)
    }, 1500)

    return () => {
      node.removeEventListener('volumechange', marqueRapport)
      clearInterval(insiste)
      clearTimeout(repli)
    }
  }, [commande, muted, mediaType, soundGeneration])

  // Une iframe remontée pour le son ne repasse pas par le démarrage muet.
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
        onPlay={commande}
        loop
        width='100%'
        height='100%'
        className='!absolute !top-0 !left-0 z-0'
      />
    </div>
  )
}
