import type { SupabaseClient } from '@supabase/supabase-js'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // keep alphanumeric, spaces, hyphens
    .trim()
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
}

export async function generateSlug(titre: string, supabase: SupabaseClient): Promise<string> {
  const base = slugify(titre)

  // Check base slug
  const { data: existing } = await supabase
    .from('refs')
    .select('slug')
    .eq('slug', base)
    .maybeSingle()

  if (!existing) return base

  // Find next available suffix
  let suffix = 2
  while (true) {
    const candidate = `${base}-${suffix}`
    const { data: collision } = await supabase
      .from('refs')
      .select('slug')
      .eq('slug', candidate)
      .maybeSingle()
    if (!collision) return candidate
    suffix++
  }
}
