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
    <div className='flex flex-col gap-1 items-center'>
      <button
        onClick={handleClick}
        aria-pressed={liked}
        aria-label={liked ? 'Retirer le like' : 'Liker cette ref'}
        className={cn(
          'relative w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95',
          isOverlay
            ? 'bg-white/20 hover:bg-white/30'
            : 'border-2 border-black bg-[var(--bg2)] hover:bg-[var(--accent2)]',
          liked && (isOverlay ? 'bg-[var(--accent1)]/80' : 'bg-[var(--accent1)]'),
        )}
      >
        <Heart
          className={cn(
            'w-5 h-5 transition-transform duration-200',
            liked && 'fill-current scale-110',
            isOverlay ? 'text-white' : 'text-[var(--fg)]',
          )}
        />
        {burst && (
          <span
            aria-hidden
            className='absolute inset-0 rounded-full border-2 border-[var(--accent1)] animate-ping'
          />
        )}
      </button>
      <span
        className={cn(
          'text-xs font-supplymono tabular-nums',
          isOverlay ? 'text-white' : 'text-[var(--fg)]/70',
        )}
      >
        {count}
      </span>
    </div>
  )
}
