import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getRequestOrigin } from '@/lib/utils/getRequestOrigin'
import { safeNextPath } from '@/lib/utils/safeNextPath'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // `next` vient de l'URL : on n'accepte qu'un chemin relatif, sinon un
  // paramètre forgé transformerait le callback en redirection ouverte.
  const next = safeNextPath(searchParams.get('next'))

  // L'hôte réel de la requête — pas NODE_ENV, qui renvoie l'URL de prod
  // depuis une preview Vercel.
  const origin = await getRequestOrigin()

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('auth callback — exchangeCodeForSession', error)
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
