import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'

const bodySchema = z.object({
  url: z.string().url(),
})

const detectPlatformFromUrl = (rawUrl: string): 'instagram' | 'facebook' | null => {
  const normalized = rawUrl.toLowerCase()

  if (normalized.includes('instagram.com')) return 'instagram'
  if (normalized.includes('facebook.com') || normalized.includes('fb.watch')) return 'facebook'

  return null
}

const metaAccessToken = process.env.META_OEMBED_APP_TOKEN
const restrictedMode = process.env.META_OEMBED_RESTRICTED === 'true'
const allowedTesters = (process.env.META_OEMBED_TESTER_EMAILS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

export async function POST(request: Request) {
  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: 'URL manquante ou invalide.' }, { status: 400 })
  }

  const { url } = parsed.data
  const platform = detectPlatformFromUrl(url)

  if (!platform) {
    return NextResponse.json(
      { error: 'Seuls les liens Instagram ou Facebook sont acceptés.' },
      { status: 400 },
    )
  }

  if (!metaAccessToken) {
    return NextResponse.json(
      { error: "Jeton oEmbed Meta non configuré côté serveur. Ajoutez META_OEMBED_APP_TOKEN." },
      { status: 500 },
    )
  }

  if (restrictedMode) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Fonctionnalité limitée aux comptes testeurs connectés pendant la phase de validation.' },
        { status: 403 },
      )
    }

    if (allowedTesters.length > 0) {
      const email = user.email?.toLowerCase() ?? ''
      if (!allowedTesters.includes(email)) {
        return NextResponse.json(
          {
            error:
              'Accès restreint aux testeurs ajoutés dans META_OEMBED_TESTER_EMAILS tant que la review Meta n\'est pas validée.',
          },
          { status: 403 },
        )
      }
    }
  }

  const endpoint =
    platform === 'instagram'
      ? 'https://graph.facebook.com/v12.0/instagram_oembed'
      : 'https://graph.facebook.com/v12.0/facebook_oembed'

  const searchParams = new URLSearchParams({
    url,
    access_token: metaAccessToken,
    omitscript: 'false',
  })

  const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.html) {
    const message = payload?.error?.message ?? payload?.message
    const fallbackError =
      "Impossible de récupérer le code d'intégration Meta. Le post est peut-être privé ou votre compte non autorisé."

    const status = response.status === 401 || response.status === 403 ? 403 : 400
    return NextResponse.json({ error: message ?? fallbackError }, { status })
  }

  return NextResponse.json({ html: payload.html as string, platform })
}
