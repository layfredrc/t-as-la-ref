import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import type { RefComment } from '@/lib/types'

const CreateCommentSchema = z.object({
  ref_id: z.uuid(),
  content: z.string().trim().min(1).max(1000),
  parent_id: z.uuid().nullish(),
})

type CommentRow = {
  id: string
  ref_id: string
  auteur_id: string | null
  content: string
  parent_id: string | null
  created_at: string
}

type AuthorRow = {
  id: string
  username: string | null
  profile_picture: string | null
}

/**
 * Les commentaires référencent `auth.users`, pas `public.users` : PostgREST ne
 * peut donc pas résoudre l'auteur via un join implicite. On hydrate en une
 * requête supplémentaire plutôt que d'ajouter une FK sur le schéma public.
 */
async function withAuthors(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: CommentRow[],
  currentUserId: string | null,
): Promise<RefComment[]> {
  const authorIds = [...new Set(rows.map((r) => r.auteur_id).filter((id): id is string => !!id))]

  const authors = new Map<string, AuthorRow>()
  if (authorIds.length > 0) {
    const { data } = await supabase
      .from('users')
      .select('id, username, profile_picture')
      .in('id', authorIds)

    for (const author of (data ?? []) as AuthorRow[]) {
      authors.set(author.id, author)
    }
  }

  return rows.map((row) => {
    const author = row.auteur_id ? authors.get(row.auteur_id) : undefined
    return {
      id: row.id,
      ref_id: row.ref_id,
      auteur_id: row.auteur_id,
      content: row.content,
      parent_id: row.parent_id,
      created_at: row.created_at,
      author: author
        ? {
            id: author.id,
            username: author.username ?? 'anonyme',
            profile_picture: author.profile_picture,
          }
        : null,
      is_mine: !!currentUserId && row.auteur_id === currentUserId,
    }
  })
}

/** GET /api/comments?ref_id=… — thread complet d'une ref, du plus ancien au plus récent. */
export async function GET(req: NextRequest) {
  const refId = req.nextUrl.searchParams.get('ref_id')
  if (!refId || !z.uuid().safeParse(refId).success) {
    return NextResponse.json({ error: 'ref_id manquant ou invalide.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('comments')
    .select('id, ref_id, auteur_id, content, parent_id, created_at')
    .eq('ref_id', refId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('comments select error', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des commentaires.' },
      { status: 500 },
    )
  }

  const comments = await withAuthors(supabase, (data ?? []) as CommentRow[], user?.id ?? null)
  return NextResponse.json({ comments })
}

/** POST /api/comments — ajoute un commentaire (ou une réponse via parent_id). */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Faut se connecter pour commenter.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 })
  }

  const parsed = CreateCommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Commentaire invalide.', details: parsed.error.issues },
      { status: 422 },
    )
  }

  const { ref_id, content, parent_id } = parsed.data

  const { data, error } = await supabase
    .from('comments')
    .insert({ ref_id, content, parent_id: parent_id ?? null, auteur_id: user.id })
    .select('id, ref_id, auteur_id, content, parent_id, created_at')
    .single()

  if (error || !data) {
    console.error('comments insert error', error)
    return NextResponse.json({ error: "Erreur lors de l'envoi du commentaire." }, { status: 500 })
  }

  const [comment] = await withAuthors(supabase, [data as CommentRow], user.id)
  return NextResponse.json({ comment }, { status: 201 })
}
