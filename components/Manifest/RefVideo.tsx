'use client'

import { useEffect, useRef, useState } from 'react'
import { PauseIcon, PlayIcon } from '@phosphor-icons/react'

const tenor = (id: string, format: string, ext: string) =>
  `https://media1.tenor.com/m/${id}${format}/ref.${ext}`

type RefVideoProps = {
  /** Identifiant Tenor de la ref (les 11 caractères avant `AAAA…`). */
  tenorId: string
  /** Nom de la ref, pour le bouton lecture. */
  refName: string
  /** Ce que la page voudrait : jouer (étape active, à l'écran) ou non. */
  shouldPlay: boolean
  className?: string
}

/**
 * Une ref en vidéo courte (WebM ≈ 80 à 520 Ko plutôt que le GIF Tenor,
 * jusqu'à 15 Mo), chargée à la première lecture seulement : l'image fixe
 * en attendant.
 *
 * La page dit si la ref devrait jouer (`shouldPlay`) ; le bouton du
 * visiteur l'emporte ensuite sur la page. Une boucle de plus de 5 s a
 * toujours son bouton pause.
 */
export default function RefVideo({ tenorId, refName, shouldPlay, className }: RefVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [choice, setChoice] = useState<'play' | 'pause' | null>(null)
  const [playing, setPlaying] = useState(false)
  const wants = choice === null ? shouldPlay : choice === 'play'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (wants) {
      video.play().catch(() => {
        // Lecture refusée (économiseur de données, onglet caché) : on reste
        // sur l'image fixe, l'état suit l'événement `pause`.
      })
    } else {
      video.pause()
    }
  }, [wants])

  return (
    <div className={`ref-video ${className ?? ''}`}>
      <video
        ref={videoRef}
        poster={tenor(tenorId, 'AAAAe', 'png')}
        muted
        loop
        playsInline
        preload='none'
        disablePictureInPicture
        aria-hidden='true'
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={tenor(tenorId, 'AAAPs', 'webm')} type='video/webm' />
        <source src={tenor(tenorId, 'AAAPo', 'mp4')} type='video/mp4' />
      </video>
      <button
        type='button'
        className='ref-video-toggle'
        onClick={() => setChoice(playing ? 'pause' : 'play')}
        aria-pressed={playing}
        aria-label={`${playing ? 'Mettre en pause' : 'Lire'} la ref « ${refName} »`}
      >
        {playing ? <PauseIcon size={20} weight='fill' /> : <PlayIcon size={20} weight='fill' />}
      </button>
    </div>
  )
}
