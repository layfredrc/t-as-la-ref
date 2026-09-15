'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Trash2, CornerDownRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils/formatRelativeDate'
import { useAddComment, useComments, useDeleteComment } from '@/queryOptions/getComments'
import { useUserProfile } from '@/queryOptions/getUserProfile'
import type { RefComment } from '@/lib/types'

const MAX_LENGTH = 1000

type CommentSectionProps = {
  refId: string
  commentsCount: number
}

export function CommentSection({ refId, commentsCount }: CommentSectionProps) {
  const { data: threads, isLoading, error } = useComments(refId)
  const { data: profile } = useUserProfile()
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const total = threads
    ? threads.reduce((sum, thread) => sum + 1 + thread.replies.length, 0)
    : commentsCount

  return (
    <section id='comments' className='flex flex-col gap-6 scroll-mt-8'>
      <div className='flex items-center gap-2'>
        <MessageCircle className='h-5 w-5 text-neon' />
        <h2 className='font-rader text-2xl uppercase leading-[0.95] text-[var(--fg)]'>Le débat</h2>
        <span className='font-supplymono text-sm tabular-nums text-neon'>({total})</span>
      </div>

      {profile ? (
        <CommentComposer refId={refId} placeholder='Explique la ref, ajoute ton grain de sel…' />
      ) : (
        <div className='border-2 border-black rounded-lg bg-[var(--accent2)] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='font-supplymono text-sm text-[var(--fg)]'>
            T&apos;as un truc à dire sur cette ref ?
          </p>
          <Link href='/login'>
            <Button size='sm' className='rounded-lg w-full sm:w-auto'>
              Se connecter
            </Button>
          </Link>
        </div>
      )}

      {isLoading && (
        <div className='flex flex-col gap-4'>
          {[0, 1, 2].map((i) => (
            <div key={i} className='flex gap-3'>
              <Skeleton className='w-9 h-9 rounded-full shrink-0' />
              <div className='flex-1 flex flex-col gap-2'>
                <Skeleton className='h-3 w-32' />
                <Skeleton className='h-3 w-full' />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className='font-supplymono text-sm text-[var(--accent1)]'>
          Impossible de charger le débat. Recharge la page.
        </p>
      )}

      {threads && threads.length === 0 && (
        <div className='border-2 border-dashed border-black/30 rounded-lg p-6 text-center'>
          <p className='font-rader uppercase text-xl text-[var(--fg)]'>Personne n&apos;a capté</p>
          <p className='font-supplymono text-sm text-[var(--fg)]/60 mt-1'>
            Sois le premier à expliquer cette ref.
          </p>
        </div>
      )}

      {threads && threads.length > 0 && (
        <ul className='flex flex-col gap-5'>
          {threads.map((thread) => (
            <li key={thread.id} className='flex flex-col gap-3'>
              <CommentRow
                comment={thread}
                refId={refId}
                canReply={!!profile}
                onReply={() => setReplyTo(replyTo === thread.id ? null : thread.id)}
              />

              {thread.replies.length > 0 && (
                <ul className='ml-2 flex flex-col gap-3 border-l-2 border-neon-soft pl-3 sm:ml-4 sm:pl-6'>
                  {thread.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentRow comment={reply} refId={refId} canReply={false} />
                    </li>
                  ))}
                </ul>
              )}

              {replyTo === thread.id && profile && (
                <div className='ml-2 pl-3 sm:ml-4 sm:pl-6'>
                  <CommentComposer
                    refId={refId}
                    parentId={thread.id}
                    placeholder={`Répondre à ${thread.author?.username ?? 'ce commentaire'}…`}
                    autoFocus
                    onDone={() => setReplyTo(null)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ─── Ligne de commentaire ────────────────────────────────────────────────────

type CommentRowProps = {
  comment: RefComment
  refId: string
  canReply: boolean
  onReply?: () => void
}

function CommentRow({ comment, refId, canReply, onReply }: CommentRowProps) {
  const deleteComment = useDeleteComment(refId)
  const username = comment.author?.username ?? 'anonyme'

  const handleDelete = () => {
    deleteComment.mutate(comment.id, {
      onError: (error) => toast.error(error.message),
    })
  }

  return (
    <div className='flex gap-3 group'>
      <Avatar className='w-9 h-9 border-2 border-black shrink-0'>
        {comment.author?.profile_picture && (
          <AvatarImage src={comment.author.profile_picture} alt={username} />
        )}
        <AvatarFallback className='bg-neon-gradient font-supplymono text-xs text-white'>
          {username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className='flex-1 min-w-0 flex flex-col gap-1'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='font-supplymono text-sm text-[var(--fg)]'>@{username}</span>
          <span className='font-supplymono text-xs text-[var(--fg)]/50'>
            {formatRelativeDate(comment.created_at)}
          </span>
        </div>

        <p className='text-sm text-[var(--fg)]/85 whitespace-pre-wrap break-words'>
          {comment.content}
        </p>

        <div className='flex items-center gap-3'>
          {canReply && onReply && (
            <button
              onClick={onReply}
              className='flex items-center gap-1 font-supplymono text-xs text-[var(--fg)]/50 hover:text-[var(--fg)] transition-colors'
            >
              <CornerDownRight className='w-3 h-3' />
              Répondre
            </button>
          )}
          {comment.is_mine && (
            <button
              onClick={handleDelete}
              disabled={deleteComment.isPending}
              className='flex items-center gap-1 font-supplymono text-xs text-[var(--fg)]/50 hover:text-[var(--accent1)] transition-colors disabled:opacity-50'
            >
              <Trash2 className='w-3 h-3' />
              {deleteComment.isPending ? 'Suppression…' : 'Supprimer'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Champ de saisie ─────────────────────────────────────────────────────────

type CommentComposerProps = {
  refId: string
  parentId?: string
  placeholder: string
  autoFocus?: boolean
  onDone?: () => void
}

function CommentComposer({
  refId,
  parentId,
  placeholder,
  autoFocus,
  onDone,
}: CommentComposerProps) {
  const [content, setContent] = useState('')
  const addComment = useAddComment(refId)

  const trimmed = content.trim()
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_LENGTH && !addComment.isPending

  const handleSubmit = () => {
    if (!canSubmit) return

    addComment.mutate(
      { content: trimmed, parentId },
      {
        onSuccess: () => {
          setContent('')
          onDone?.()
        },
        onError: (error) => toast.error(error.message),
      },
    )
  }

  return (
    <div className='flex flex-col gap-2'>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        maxLength={MAX_LENGTH}
        // ⌘/Ctrl + Entrée pour envoyer sans quitter le clavier.
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        className='focus-neon resize-none rounded-lg border-2 border-black bg-[var(--bg2)] focus-visible:ring-0'
      />

      <div className='flex items-center justify-between gap-3'>
        <span
          className={cn(
            'font-supplymono text-xs tabular-nums',
            trimmed.length > MAX_LENGTH * 0.9 ? 'text-[var(--accent1)]' : 'text-[var(--fg)]/50',
          )}
        >
          {trimmed.length}/{MAX_LENGTH}
        </span>

        <div className='flex items-center gap-2'>
          {onDone && (
            <Button size='sm' variant='ghost' onClick={onDone} className='rounded-lg'>
              Annuler
            </Button>
          )}
          <Button size='sm' onClick={handleSubmit} disabled={!canSubmit} className='rounded-lg'>
            {addComment.isPending ? 'Envoi…' : 'Envoyer'}
          </Button>
        </div>
      </div>
    </div>
  )
}
