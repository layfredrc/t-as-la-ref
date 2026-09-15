import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { MediaEmbed } from '@/components/ref/MediaEmbed'
import { CommentSection } from '@/components/ref/CommentSection'
import { LikeButton } from '@/components/ref/LikeButton'
import { BarometerReadout } from '@/components/ref/Barometer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { MediaType, Tag } from '@/lib/types'
import { mediaTypeLabels } from '@/lib/utils/detectMediaType'

type Props = {
  params: Promise<{ slug: string }>
}

const scoreCultureLabel: Record<string, string> = {
  inconnu: 'Inconnu 🤷',
  'gen-z': 'Only Gen Z ⚡',
  cultissime: 'Cultissime 🏆',
}

// Couleur par axe de tag — cohérent avec la RefCard du feed.
const tagColorByType: Record<Tag['type'], string> = {
  type_ref: 'bg-[var(--accent1)]',
  origine: 'bg-[var(--accent5)]',
  vibe: 'bg-[var(--accent3)]',
}

const REF_SELECT = `
  id, slug, titre, media_url, media_type, contexte, score_culture,
  likes_count, comments_count, drole_score, importance_score, created_at, auteur_id,
  refs_tags ( tags ( id, label, emoji, type, slug ) ),
  ref_hashtags ( label )
`

async function getRef(slug: string) {
  const supabase = await createClient()

  const { data: ref } = await supabase
    .from('refs')
    .select(REF_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!ref) return null

  const tags: Tag[] = (ref.refs_tags ?? []).flatMap((rt: { tags: unknown }) => {
    const tag = rt.tags as Tag | Tag[] | null
    if (!tag) return []
    return Array.isArray(tag) ? tag : [tag]
  })

  const hashtags: string[] = (ref.ref_hashtags ?? []).map((h: { label: string }) => h.label)

  // `auteur_id` pointe sur auth.users : le profil public se récupère à part.
  let author: { username: string | null; profile_picture: string | null } | null = null
  if (ref.auteur_id) {
    const { data } = await supabase
      .from('users')
      .select('username, profile_picture')
      .eq('id', ref.auteur_id)
      .maybeSingle()
    author = data ?? null
  }

  return { ref, tags, hashtags, author }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getRef(slug)

  if (!result) return { title: 'Ref introuvable — T’as la ref ?' }

  const { ref } = result
  return {
    title: `${ref.titre} — T’as la ref ?`,
    description:
      ref.contexte ?? 'Une ref de plus dans la bibliothèque vivante de l’internet francophone.',
    openGraph: {
      title: ref.titre,
      description: ref.contexte ?? undefined,
      type: 'article',
    },
  }
}

export default async function RefPage({ params }: Props) {
  const { slug } = await params
  const result = await getRef(slug)

  if (!result) notFound()

  const { ref, tags, hashtags, author } = result
  const mediaLabel = mediaTypeLabels[ref.media_type as MediaType]
  const username = author?.username ?? 'anonyme'

  return (
    <main className='min-h-screen bg-[var(--bg)] px-4 py-8 sm:py-12'>
      <div className='max-w-2xl mx-auto flex flex-col gap-8'>
        <Link
          href='/feed'
          className='flex items-center gap-2 font-supplymono text-sm text-[var(--fg)]/70 hover:text-[var(--fg)] transition-colors w-fit'
        >
          <ArrowLeft className='w-4 h-4' />
          Retour au feed
        </Link>

        {/* ── Entête ───────────────────────────────────────────── */}
        <header className='flex flex-col gap-4'>
          {mediaLabel && (
            <span
              className={`font-supplymono text-xs px-2.5 py-1 rounded-full text-white w-fit ${mediaLabel.color}`}
            >
              {mediaLabel.emoji} {mediaLabel.label}
            </span>
          )}

          <h1 className='font-rader uppercase text-3xl sm:text-5xl leading-[0.95] text-[var(--fg)] break-words hyphens-auto'>
            {ref.titre}
          </h1>

          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-supplymono text-xs text-[var(--fg)]/70'>Score Culture 🔥</span>
            <span className='font-supplymono text-xs px-2.5 py-1 rounded-full border-2 border-black bg-[var(--accent2)] text-[var(--fg)]'>
              {scoreCultureLabel[ref.score_culture] ?? ref.score_culture}
            </span>
          </div>

          <BarometerReadout drole={ref.drole_score} importance={ref.importance_score} />

          <div className='flex flex-wrap gap-2'>
            {tags.map((tag) => (
              <span
                key={tag.id}
                className={`font-supplymono text-xs px-2.5 py-1 rounded-full border-2 border-black text-[var(--fg)] ${tagColorByType[tag.type]}`}
              >
                {tag.emoji} {tag.label}
              </span>
            ))}
          </div>
        </header>

        {/* ── Média ────────────────────────────────────────────── */}
        {/*
          VideoPlayer impose ses propres largeurs max (jusqu'à max-w-2xl en 2xl)
          pour le feed. Ici on les neutralise variante par variante — c'est ce que
          tailwind-merge sait dédupliquer — et on centre : le cadre épouse le
          player au lieu de déborder derrière lui.
        */}
        <div className='flex justify-center'>
          <MediaEmbed
            url={ref.media_url}
            mediaType={ref.media_type as MediaType}
            className='w-full max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm 2xl:max-w-sm rounded-2xl border-2 border-black'
          />
        </div>

        {/* ── Contexte ─────────────────────────────────────────── */}
        {ref.contexte && (
          <div className='border-2 border-black rounded-lg bg-[var(--bg2)] p-5 flex flex-col gap-2'>
            <span className='font-supplymono text-xs uppercase text-[var(--fg)]/70'>
              Le contexte
            </span>
            <p className='text-[var(--fg)]/85 whitespace-pre-wrap'>{ref.contexte}</p>
          </div>
        )}

        {hashtags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {hashtags.map((label) => (
              <span
                key={label}
                className='font-supplymono text-xs px-2 py-0.5 rounded-full bg-[var(--bg2)] text-[var(--fg)]/70'
              >
                #{label}
              </span>
            ))}
          </div>
        )}

        {/* ── Auteur + actions ─────────────────────────────────── */}
        <div className='flex items-center justify-between gap-4 border-t-2 border-black/10 pt-6'>
          <div className='flex items-center gap-3 min-w-0'>
            <Avatar className='w-10 h-10 shrink-0 border-2 border-black'>
              {author?.profile_picture && (
                <AvatarImage src={author.profile_picture} alt={username} />
              )}
              <AvatarFallback className='bg-neon-gradient font-supplymono text-xs text-white'>
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col min-w-0'>
              <span className='font-supplymono text-sm text-[var(--fg)] truncate'>@{username}</span>
              <span className='font-supplymono text-xs text-[var(--fg)]/70'>
                {new Date(ref.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
              </span>
            </div>
          </div>

          <div className='shrink-0'>
            <LikeButton refId={ref.id} initialCount={ref.likes_count} variant='solid' />
          </div>
        </div>

        {/* ── Débat ────────────────────────────────────────────── */}
        <CommentSection refId={ref.id} commentsCount={ref.comments_count ?? 0} />
      </div>
    </main>
  )
}
