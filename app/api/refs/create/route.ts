import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { generateSlug } from '@/lib/utils/generateSlug'
import { MEDIA_TYPES } from '@/lib/utils/detectMediaType'

// Même liste que `detectMediaType` et que la contrainte CHECK (migration 007) :
// une plateforme reconnue côté formulaire doit pouvoir être publiée.
const MediaTypeEnum = z.enum(MEDIA_TYPES)

const CreateRefSchema = z.object({
  titre: z.string().min(1).max(60),
  media_url: z.url(),
  media_type: MediaTypeEnum,
  thumbnail: z.url().optional(),
  contexte: z.string().max(500).optional(),
  score_culture: z.enum(['inconnu', 'gen-z', 'cultissime']).optional(),
  // Un tag par axe (type / origine / vibe) — voir le flow d'ajout.
  tag_ids: z.array(z.uuid()).min(1).max(3),
  derives: z.array(z.url()).max(3).optional(),
  hashtags: z.array(z.string().min(1).max(50)).max(10).optional(),
  drole_score: z.number().int().min(1).max(5).optional(),
  importance_score: z.number().int().min(1).max(5).optional(),
})

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  // 2. Validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 })
  }

  const parsed = CreateRefSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', details: parsed.error.issues },
      { status: 422 },
    )
  }

  const {
    titre,
    media_url,
    media_type,
    thumbnail,
    contexte,
    score_culture,
    tag_ids,
    derives,
    hashtags,
    drole_score,
    importance_score,
  } = parsed.data

  // 3. Generate unique slug
  let slug: string
  try {
    slug = await generateSlug(titre, supabase)
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la génération du slug.' }, { status: 500 })
  }

  // 4. INSERT ref
  const { data: ref, error: refError } = await supabase
    .from('refs')
    .insert({
      slug,
      titre,
      media_url,
      media_type,
      thumbnail: thumbnail ?? null,
      contexte: contexte ?? null,
      score_culture: score_culture ?? 'inconnu',
      drole_score: drole_score ?? 3,
      importance_score: importance_score ?? 3,
      auteur_id: user.id,
    })
    .select('id, slug')
    .single()

  if (refError || !ref) {
    console.error('refs insert error', refError)

    /**
     * 23514 = `check_violation`.
     *
     * Le schéma zod couvre déjà tous les CHECK de la table (titre, contexte,
     * score_culture, baromètres) sauf un : `refs_media_type_check`, qui
     * n'accepte les neuf plateformes qu'une fois la migration 007 appliquée.
     * Sans ce cas, une base en retard d'une migration ne renvoyait qu'un
     * « Erreur lors de la création de la ref. » impossible à diagnostiquer
     * depuis le navigateur.
     */
    if (refError?.code === '23514' && refError.message?.includes('media_type')) {
      console.error(
        `media_type « ${media_type} » refusé par la base : applique supabase/migrations/007_media_types.sql`,
      )
      return NextResponse.json(
        {
          error: `Les refs « ${media_type} » ne sont pas encore acceptées par la base de données. Migration 007 à appliquer.`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: 'Erreur lors de la création de la ref.' }, { status: 500 })
  }

  // 5. INSERT refs_tags
  const { error: tagsError } = await supabase
    .from('refs_tags')
    .insert(tag_ids.map((tag_id) => ({ ref_id: ref.id, tag_id })))

  if (tagsError) {
    console.error('refs_tags insert error', tagsError)
    // Non-blocking: ref is created, continue
  }

  // 6. INSERT refs_derives
  if (derives && derives.length > 0) {
    const { error: derivesError } = await supabase.from('refs_derives').insert(
      derives.map((url, position) => ({
        ref_id: ref.id,
        url,
        position,
      })),
    )

    if (derivesError) {
      console.error('refs_derives insert error', derivesError)
      // Non-blocking
    }
  }

  // 7. INSERT ref_hashtags (triggers handle hashtags_index counts)
  if (hashtags && hashtags.length > 0) {
    const { error: hashtagsError } = await supabase
      .from('ref_hashtags')
      .insert(hashtags.map((label) => ({ ref_id: ref.id, label })))

    if (hashtagsError) {
      console.error('ref_hashtags insert error', hashtagsError)
      // Non-blocking
    }
  }

  return NextResponse.json({ slug: ref.slug }, { status: 201 })
}
