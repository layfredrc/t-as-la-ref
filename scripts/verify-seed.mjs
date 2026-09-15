#!/usr/bin/env node
/**
 * Vérifie que chaque `media_url` de supabase/seed_refs.sql pointe sur une
 * vidéo qui existe vraiment.
 *
 * Le seed a été rédigé sans accès réseau : les identifiants de vidéos sont des
 * suppositions. Ce script les confronte à l'API oEmbed du fournisseur, qui
 * répond 200 + le titre réel quand la vidéo existe, une erreur sinon.
 *
 *   node scripts/verify-seed.mjs
 *
 * Sortie 1 si au moins une URL est morte, pour pouvoir l'enchaîner en CI.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SEED_PATH = join(here, '..', 'supabase', 'seed_refs.sql')

const OEMBED = [
  { test: /youtube\.com|youtu\.be/, endpoint: 'https://www.youtube.com/oembed?format=json&url=' },
  { test: /tiktok\.com/, endpoint: 'https://www.tiktok.com/oembed?url=' },
  { test: /vimeo\.com/, endpoint: 'https://vimeo.com/api/oembed.json?url=' },
]

/** Récupère (slug, titre, url) de chaque tuple VALUES du seed. */
function parseSeed(sql) {
  const entries = []
  // '' est l'échappement d'une apostrophe en SQL : le motif doit l'accepter
  // à l'intérieur du titre (ex. 'Mais c''est pas faux').
  const row = /\(\s*'([a-z0-9-]+)',\s*'((?:[^']|'')*)',\s*'(https?:\/\/[^']+)'/g
  let match
  while ((match = row.exec(sql)) !== null) {
    entries.push({
      slug: match[1],
      titre: match[2].replace(/''/g, "'"),
      url: match[3],
    })
  }
  return entries
}

async function check(url) {
  const provider = OEMBED.find((p) => p.test.test(url))
  if (!provider) return { ok: null, reason: 'fournisseur sans oEmbed — à vérifier à la main' }

  try {
    const res = await fetch(provider.endpoint + encodeURIComponent(url), {
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
    const data = await res.json()
    return { ok: true, realTitle: data.title }
  } catch (error) {
    return { ok: false, reason: error.name === 'TimeoutError' ? 'timeout' : error.message }
  }
}

const sql = await readFile(SEED_PATH, 'utf8')
const entries = parseSeed(sql)

if (entries.length === 0) {
  console.error('Aucune ref trouvée dans le seed — le format du fichier a changé ?')
  process.exit(1)
}

console.log(`Vérification de ${entries.length} URLs…\n`)

const dead = []
const manual = []

for (const entry of entries) {
  const result = await check(entry.url)

  if (result.ok === true) {
    console.log(`✅ ${entry.slug}`)
    console.log(`   attendu : ${entry.titre}`)
    console.log(`   réel    : ${result.realTitle}\n`)
  } else if (result.ok === null) {
    manual.push(entry)
    console.log(`➖ ${entry.slug} — ${result.reason}\n`)
  } else {
    dead.push({ ...entry, reason: result.reason })
    console.log(`❌ ${entry.slug} — ${result.reason}`)
    console.log(`   à remplacer, cherche : « ${entry.titre} »\n`)
  }
}

console.log('─'.repeat(60))
console.log(`${entries.length - dead.length - manual.length} OK · ${dead.length} à remplacer · ${manual.length} à vérifier à la main`)

if (dead.length > 0) {
  console.log('\nURLs à corriger dans supabase/seed_refs.sql :')
  for (const entry of dead) console.log(`  ${entry.slug.padEnd(28)} ${entry.url}`)
  process.exit(1)
}
