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

  const { data: existing, error: selectError } = await supabase
    .from('likes')
    .select('ref_id')
    .eq('ref_id', refId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('likes select error', selectError)
    return NextResponse.json({ error: 'Erreur lors du like.' }, { status: 500 })
  }

  if (existing) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('ref_id', refId)
      .eq('user_id', user.id)

    if (error) {
      console.error('likes delete error', error)
      return NextResponse.json({ error: 'Erreur lors du unlike.' }, { status: 500 })
    }
  } else {
    const { error } = await supabase.from('likes').insert({ ref_id: refId, user_id: user.id })

    if (error) {
      console.error('likes insert error', error)
      return NextResponse.json({ error: 'Erreur lors du like.' }, { status: 500 })
    }
  }

  const { data: ref } = await supabase
    .from('refs')
    .select('likes_count')
    .eq('id', refId)
    .maybeSingle()

  return NextResponse.json({
    liked: !existing,
    likes_count: ref?.likes_count ?? 0,
  })
}
