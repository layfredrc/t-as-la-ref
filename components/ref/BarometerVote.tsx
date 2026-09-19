'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BarometerReadout, DroleBarometer, ImportanceBarometer } from './Barometer'
import { Button } from '@/components/ui/button'
import { clampScore, type BarometerScore } from '@/lib/utils/barometers'
import { useVoteBarometre } from '@/queryOptions/getBarometerVote'
import type { BarometerVote } from '@/lib/types'

/** Délai après le dernier cran avant d'envoyer — un drag émet ~5 onChange. */
const SAVE_DELAY_MS = 600

type BarometerVoteProps = {
  refId: string
  droleAverage: number
  importanceAverage: number
  votesCount: number
  /** Vote existant de l'utilisateur, ou `null` s'il n'a pas encore voté. */
  myVote: BarometerVote | null
  isAuthenticated: boolean
  /** Retour après connexion — la page de la ref consultée. */
  loginHref: string
}

export function BarometerVote({
  refId,
  droleAverage,
  importanceAverage,
  votesCount,
  myVote,
  isAuthenticated,
  loginHref,
}: BarometerVoteProps) {
  const router = useRouter()
  const voteMutation = useVoteBarometre(refId)

  // Le curseur part du vote existant s'il y en a un, sinon de la moyenne :
  // on ne demande jamais de repartir de zéro.
  const [drole, setDrole] = useState<BarometerScore>(clampScore(myVote?.drole ?? droleAverage))
  const [importance, setImportance] = useState<BarometerScore>(
    clampScore(myVote?.importance ?? importanceAverage),
  )

  const [averages, setAverages] = useState({
    drole: clampScore(droleAverage),
    importance: clampScore(importanceAverage),
    votes: votesCount,
  })
  const [hasVoted, setHasVoted] = useState(myVote !== null)

  const timer = useRef<number | null>(null)
  /** Dernier vote confirmé par le serveur — évite de renvoyer l'identique. */
  const saved = useRef<BarometerVote | null>(myVote)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const scheduleSave = (next: BarometerVote) => {
    if (timer.current) window.clearTimeout(timer.current)

    timer.current = window.setTimeout(() => {
      const current = saved.current
      if (current && current.drole === next.drole && current.importance === next.importance) {
        return
      }

      voteMutation.mutate(next, {
        onSuccess: (data) => {
          saved.current = data.vote
          setHasVoted(true)
          setAverages({
            drole: clampScore(data.drole_score),
            importance: clampScore(data.importance_score),
            votes: data.votes_count,
          })
        },
        onError: (error) => {
          // Le curseur garde la position choisie : on signale l'échec plutôt
          // que de faire sauter la valeur sous le doigt de l'utilisateur.
          if (error.message.toLowerCase().includes('connecter')) {
            toast.error('Faut se connecter pour voter 👀', {
              action: { label: 'Connexion', onClick: () => router.push(loginHref) },
            })
            return
          }
          toast.error(error.message)
        },
      })
    }, SAVE_DELAY_MS)
  }

  const handleDrole = (value: BarometerScore) => {
    setDrole(value)
    scheduleSave({ drole: value, importance })
  }

  const handleImportance = (value: BarometerScore) => {
    setImportance(value)
    scheduleSave({ drole, importance: value })
  }

  if (!isAuthenticated) {
    return (
      <section className='flex flex-col gap-4 rounded-lg border-2 border-black bg-[var(--bg2)] p-5'>
        <h2 className='font-rader uppercase text-xl leading-[0.95] text-[var(--fg)]'>
          Le baromètre de la communauté
        </h2>

        <BarometerReadout
          drole={averages.drole}
          importance={averages.importance}
          variant='full'
          votesCount={averages.votes}
        />

        <p className='font-supplymono text-xs text-[var(--fg)]/70'>
          Connecte-toi pour donner ton avis et faire bouger la note.
        </p>

        <Button asChild size='sm' className='w-full rounded-lg sm:w-fit'>
          <Link href={loginHref}>Connexion</Link>
        </Button>
      </section>
    )
  }

  return (
    <section className='flex flex-col gap-5 rounded-lg border-2 border-black bg-[var(--bg2)] p-5'>
      <div className='flex flex-col gap-1'>
        <h2 className='font-rader uppercase text-xl leading-[0.95] text-[var(--fg)]'>
          {hasVoted ? 'Ton vote' : 'À toi de juger'}
        </h2>
        <p className='font-supplymono text-xs text-[var(--fg)]/70'>
          {hasVoted
            ? 'Tu peux le changer quand tu veux — la moyenne suit.'
            : 'Glisse les curseurs, ça part tout seul.'}
        </p>
      </div>

      <div className='flex flex-col gap-5'>
        <DroleBarometer value={drole} onChange={handleDrole} />
        <ImportanceBarometer value={importance} onChange={handleImportance} />
      </div>

      <div
        className='flex flex-col gap-3 border-t-2 border-black/10 pt-4'
        aria-live='polite'
        aria-atomic='true'
      >
        <span className='font-supplymono text-xs text-[var(--fg)]/70'>
          {voteMutation.isPending
            ? 'Enregistrement…'
            : hasVoted
              ? 'Vote enregistré ✅'
              : 'Pas encore voté'}
        </span>

        <BarometerReadout
          drole={averages.drole}
          importance={averages.importance}
          variant='full'
          votesCount={averages.votes}
        />
      </div>
    </section>
  )
}
