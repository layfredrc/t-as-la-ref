import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'

const ParamsSchema = z.object({ id: z.uuid() })

type Params = { params: Promise<{ id: string }> }

/**
 * POST /api/refs/[id]/like — toggle du like de l'utilisateur courant.
 * Les compteurs sur `refs` sont maintenus par trigger (migration 003).
 */
export async function POST(_req: Request, { params }: Params) {
  const parsed = ParamsSchema.safeParse(await params)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ref introuvable.' }, { status: 400 })
  }
  const refId = parsed.data.id

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Faut se connecter pour liker.' }, { status: 401 })
  }

  // Toggle sans lecture préalable : un SELECT puis un INSERT laisse deux
  // requêtes simultanées (double tap) conclure toutes les deux « pas encore
  // liké », et la seconde violait la clé primaire de `likes` en 23505.
  // Ici chaque instruction est atomique et idempotente.
  const { data: removed, error: deleteError } = await supabase
    .from('likes')
    .delete()
    .eq('ref_id', refId)
    .eq('user_id', user.id)
    .select('ref_id')

  if (deleteError) {
    console.error('likes delete error', deleteError)
    return NextResponse.json({ error: 'Erreur lors du unlike.' }, { status: 500 })
  }

  const wasLiked = (removed?.length ?? 0) > 0

  if (!wasLiked) {
    // Le doublon est ignoré au lieu de faire échouer la requête : si une
    // autre requête a déjà inséré la ligne, l'état final est le même.
    const { error: insertError } = await supabase
      .from('likes')
      .upsert(
        { ref_id: refId, user_id: user.id },
        { onConflict: 'user_id,ref_id', ignoreDuplicates: true },
      )

    if (insertError) {
      console.error('likes insert error', insertError)
      return NextResponse.json({ error: 'Erreur lors du like.' }, { status: 500 })
    }
  }

  const { data: ref } = await supabase
    .from('refs')
    .select('likes_count')
    .eq('id', refId)
    .maybeSingle()

  return NextResponse.json({
    liked: !wasLiked,
    likes_count: ref?.likes_count ?? 0,
  })
}
