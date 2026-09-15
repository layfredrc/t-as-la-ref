import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'

const ParamsSchema = z.object({ id: z.uuid() })

type Params = { params: Promise<{ id: string }> }

/** DELETE /api/comments/[id] — supprime son propre commentaire. */
export async function DELETE(_req: Request, { params }: Params) {
  const parsed = ParamsSchema.safeParse(await params)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Commentaire introuvable.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  // La policy `comments_delete_owner` protège déjà la ligne ; le filtre
  // explicite permet de distinguer un 403 d'un 404.
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', parsed.data.id)
    .eq('auteur_id', user.id)
    .select('id')

  if (error) {
    console.error('comments delete error', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Commentaire introuvable.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
