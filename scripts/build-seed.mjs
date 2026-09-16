#!/usr/bin/env node
/**
 * Génère supabase/seed_refs.sql à partir de supabase/seed-refs.json.
 *
 * Le JSON porte le contenu éditorial (titres, contextes, tags, scores) ; il ne
 * reste qu'à y coller les `media_url`. Chaque URL est confrontée à l'API oEmbed
 * du fournisseur, qui renvoie le titre réel de la vidéo : on voit donc
 * immédiatement si le lien collé correspond bien à la ref annoncée.
 *
 *   node scripts/build-seed.mjs              vérifie puis génère le SQL
 *   node scripts/build-seed.mjs --check-only vérifie sans rien écrire
 *
 * Le SQL n'est écrit que si les 16 URLs répondent. Sortie 1 sinon.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const JSON_PATH = join(here, '..', 'supabase', 'seed-refs.json')
const SQL_PATH = join(here, '..', 'supabase', 'seed_refs.sql')
const checkOnly = process.argv.includes('--check-only')

const PROVIDERS = [
  {
    mediaType: 'youtube',
    test: /youtube\.com\/watch|youtu\.be\//,
    oembed: 'https://www.youtube.com/oembed?format=json&url=',
  },
  {
    mediaType: 'tiktok',
    test: /tiktok\.com/,
    oembed: 'https://www.tiktok.com/oembed?url=',
  },
  {
    mediaType: 'twitter',
    test: /twitter\.com\/.+\/status|x\.com\/.+\/status/,
    oembed: 'https://publish.twitter.com/oembed?url=',
  },
]

/** Échappement SQL : une apostrophe se double. */
const q = (value) => `'${String(value).replace(/'/g, "''")}'`
const arr = (values) => `ARRAY[${values.map(q).join(',')}]::text[]`

async function verify(entry) {
  if (!entry.media_url) return { state: 'empty' }

  const provider = PROVIDERS.find((p) => p.test.test(entry.media_url))
  if (!provider) return { state: 'unknown-provider' }

  try {
    const res = await fetch(provider.oembed + encodeURIComponent(entry.media_url), {
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { state: 'dead', reason: `HTTP ${res.status}` }
    const data = await res.json()
    // Le media_type est déduit de l'URL : coller un lien TikTok sur une entrée
    // marquée « youtube » ne doit pas produire un embed cassé.
    return { state: 'ok', realTitle: data.title, mediaType: provider.mediaType }
  } catch (error) {
    return { state: 'dead', reason: error.name === 'TimeoutError' ? 'timeout' : error.message }
  }
}

function toSql(entries) {
  const rows = entries
    .map(
      (e) => `      (${q(e.slug)}, ${q(e.titre)},
       ${q(e.media_url)}, ${q(e.media_type)},
       ${q(e.contexte)},
       ${q(e.score_culture)}, ${e.drole_score}, ${e.importance_score},
       ${q(e.tags.type_ref)}, ${q(e.tags.origine)}, ${q(e.tags.vibe)},
       ${arr(e.hashtags)})`,
    )
    .join(',\n\n')

  return `-- ============================================================
-- Seed — refs de démonstration
--
-- FICHIER GÉNÉRÉ — ne pas éditer à la main.
-- Source : supabase/seed-refs.json
-- Régénérer : npm run seed:build
--
-- Toutes les media_url ci-dessous ont répondu à l'API oEmbed de leur
-- fournisseur au moment de la génération.
--
-- À exécuter APRÈS les migrations 001 à 004 et supabase/seed.sql (les tags).
-- ============================================================

DO $$
DECLARE
  seed RECORD;
  new_ref_id UUID;
  tag_slug TEXT;
  hashtag TEXT;
BEGIN
  FOR seed IN
    SELECT * FROM (VALUES
${rows}
    ) AS t(
      slug, titre, media_url, media_type, contexte, score_culture,
      drole, importance, tag_type, tag_origine, tag_vibe, hashtags
    )
  LOOP
    -- PL/pgSQL met la cible d'un RETURNING INTO à NULL quand rien n'est
    -- renvoyé, mais on le pose explicitement pour que ce soit lisible.
    new_ref_id := NULL;

    INSERT INTO refs (
      slug, titre, media_url, media_type, contexte,
      score_culture, drole_score, importance_score, status, auteur_id
    )
    VALUES (
      seed.slug, seed.titre, seed.media_url, seed.media_type, seed.contexte,
      seed.score_culture, seed.drole, seed.importance, 'published', NULL
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO new_ref_id;

    -- Slug déjà présent : on ne retouche pas une ref existante.
    CONTINUE WHEN new_ref_id IS NULL;

    FOREACH tag_slug IN ARRAY ARRAY[seed.tag_type, seed.tag_origine, seed.tag_vibe]
    LOOP
      INSERT INTO refs_tags (ref_id, tag_id)
      SELECT new_ref_id, id FROM tags WHERE slug = tag_slug
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOREACH hashtag IN ARRAY seed.hashtags
    LOOP
      INSERT INTO ref_hashtags (ref_id, label) VALUES (new_ref_id, hashtag);
    END LOOP;
  END LOOP;
END
$$;
`
}

const entries = JSON.parse(await readFile(JSON_PATH, 'utf8'))
console.log(`Vérification de ${entries.length} refs…\n`)

const missing = []
const dead = []

for (const entry of entries) {
  const result = await verify(entry)

  switch (result.state) {
    case 'ok':
      entry.media_type = result.mediaType
      console.log(`✅ ${entry.slug}`)
      console.log(`   ${entry.titre}  →  ${result.realTitle}\n`)
      break
    case 'empty':
      missing.push(entry)
      console.log(`⬜ ${entry.slug} — media_url vide`)
      console.log(`   à remplir, cherche : « ${entry.titre} »\n`)
      break
    case 'unknown-provider':
      dead.push({ entry, reason: 'fournisseur non géré' })
      console.log(`❓ ${entry.slug} — fournisseur non géré : ${entry.media_url}\n`)
      break
    default:
      dead.push({ entry, reason: result.reason })
      console.log(`❌ ${entry.slug} — ${result.reason}`)
      console.log(`   à remplacer, cherche : « ${entry.titre} »\n`)
  }
}

const ok = entries.length - missing.length - dead.length
console.log('─'.repeat(60))
console.log(`${ok} OK · ${missing.length} à remplir · ${dead.length} à remplacer`)

if (missing.length > 0 || dead.length > 0) {
  console.log(`\nComplète « media_url » dans supabase/seed-refs.json :`)
  for (const entry of missing) console.log(`  ${entry.slug.padEnd(24)} (vide)`)
  for (const { entry, reason } of dead) console.log(`  ${entry.slug.padEnd(24)} ${reason}`)
  console.log('\nLe SQL ne sera généré que quand tout sera vert.')
  process.exit(1)
}

if (checkOnly) {
  console.log('\n--check-only : rien écrit.')
  process.exit(0)
}

// Les media_type corrigés d'après l'URL sont réécrits dans le JSON source.
await writeFile(JSON_PATH, JSON.stringify(entries, null, 2) + '\n')
await writeFile(SQL_PATH, toSql(entries))
console.log(`\n✍️  supabase/seed_refs.sql généré (${entries.length} refs).`)
console.log('   Colle-le dans le SQL Editor Supabase.')
