'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useMyLikes, useToggleLike } from '@/queryOptions/getLikes'

type LikeButtonProps = {
  refId: string
  /** Compteur issu de la ref chargée — base du calcul optimiste. */
  initialCount: number
  /** `overlay` sur le feed (fond sombre), `solid` sur la page ref (fond clair). */
  variant?: 'overlay' | 'solid'
}

export function LikeButton({ refId, initialCount, variant = 'overlay' }: LikeButtonProps) {
  const router = useRouter()
  const { data: myLikes } = useMyLikes()
  const toggleLike = useToggleLike()

  const [count, setCount] = useState(initialCount)
  // Dernière valeur *reçue en prop* — distincte de `count`, qui intègre les
  // toggles locaux. Comparer `count` à la prop reviendrait à écraser un like
  // fraîchement posé dès que le parent re-rend avec son compteur d'origine.
  const [prevInitialCount, setPrevInitialCount] = useState(initialCount)
  const [burst, setBurst] = useState(false)

  // Resynchronise seulement quand la ref rechargée apporte un compteur différent
  // (pattern React « ajuster l'état pendant le rendu »).
  if (initialCount !== prevInitialCount) {
    setPrevInitialCount(initialCount)
    setCount(initialCount)
  }

  const liked = (myLikes ?? []).includes(refId)
  const isOverlay = variant === 'overlay'

  const handleClick = () => {
    // Tant que la liste des likes n'est pas chargée, on ne connaît pas l'état
    // de départ : cliquer enverrait un toggle dans le mauvais sens.
    if (!myLikes) return
    // Le serveur encaisse les doubles appels, mais un second clic pendant la
    // requête inverserait l'affichage optimiste pour rien.
    if (toggleLike.isPending) return

    const previousCount = count
    setCount((c) => (liked ? Math.max(c - 1, 0) : c + 1))

    setBurst(true)
    window.setTimeout(() => setBurst(false), 450)

    toggleLike.mutate(refId, {
      onSuccess: (data) => {
        setCount(data.likes_count)
      },
      onError: (error) => {
        setCount(previousCount)

        if (error.message.toLowerCase().includes('connecter')) {
          toast.error('Faut se connecter pour liker 👀', {
            action: { label: 'Connexion', onClick: () => router.push('/login') },
          })
          return
        }
        toast.error(error.message)
      },
    })
  }

  return (
    <div className='flex flex-col items-center gap-1'>
      <button
        onClick={handleClick}
        aria-pressed={liked}
        aria-label={liked ? 'Retirer le like' : 'Liker cette ref'}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 sm:h-11 sm:w-11',
          // Le fond reste neutre dans les deux variantes : c'est l'icône qui
          // porte la couleur, comme sur Instagram.
          isOverlay
            ? 'hover:bg-white/15'
            : 'border-2 border-black bg-[var(--bg2)] hover:bg-[var(--accent2)]',
        )}
      >
        <Heart
          className={cn(
            'transition-all duration-200',
            isOverlay
              ? 'h-6 w-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:h-7 sm:w-7'
              : 'h-5 w-5',
            liked
              ? 'scale-110 fill-[var(--accent1)] text-[var(--accent1)]'
              : isOverlay
                ? 'fill-white text-white'
                : 'text-[var(--fg)]',
            burst && 'scale-125',
          )}
        />
        {burst && (
          <span
            aria-hidden
            className='absolute inset-0 animate-ping rounded-full border-2 border-[var(--accent1)]'
          />
        )}
      </button>
      <span
        className={cn(
          'font-supplymono text-xs tabular-nums',
          isOverlay ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]' : 'text-[var(--fg)]/70',
        )}
      >
        {count}
      </span>
    </div>
  )
}
