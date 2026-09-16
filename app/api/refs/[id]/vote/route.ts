import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'

const ParamsSchema = z.object({ id: z.uuid() })

const BodySchema = z.object({
  drole: z.number().int().min(1).max(5),
  importance: z.number().int().min(1).max(5),
})

type Params = { params: Promise<{ id: string }> }

/**
 * POST /api/refs/[id]/vote — pose ou met à jour le vote de l'utilisateur
 * courant sur les deux baromètres.
 *
 * L'upsert rend le revote idempotent : voter une deuxième fois écrase le
 * vote précédent au lieu d'en créer un second. Les moyennes portées par
 * `refs.drole_score` / `refs.importance_score` sont recalculées par le
 * trigger de la migration 006.
 */
export async function POST(req: Request, { params }: Params) {
  const parsedParams = ParamsSchema.safeParse(await params)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Ref introuvable.' }, { status: 400 })
  }
  const refId = parsedParams.data.id

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 })
  }

  const parsedBody = BodySchema.safeParse(rawBody)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Note invalide — attendu 1 à 5.' }, { status: 400 })
  }
  const { drole, importance } = parsedBody.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Faut se connecter pour voter.' }, { status: 401 })
  }

  const { error: upsertError } = await supabase
    .from('ref_votes')
    .upsert({ ref_id: refId, user_id: user.id, drole, importance }, { onConflict: 'user_id,ref_id' })

  if (upsertError) {
    console.error('ref_votes upsert error', upsertError)
    return NextResponse.json({ error: 'Erreur lors du vote.' }, { status: 500 })
  }

  // Le trigger a déjà tourné : on relit les moyennes plutôt que de les
  // recalculer côté client, pour que l'affichage colle à la base.
  const { data: ref } = await supabase
    .from('refs')
    .select('drole_score, importance_score, votes_count')
    .eq('id', refId)
    .maybeSingle()

  return NextResponse.json({
    vote: { drole, importance },
    drole_score: ref?.drole_score ?? drole,
    importance_score: ref?.importance_score ?? importance,
    votes_count: ref?.votes_count ?? 1,
  })
}
