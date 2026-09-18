'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { getRequestOrigin } from '@/lib/utils/getRequestOrigin'
import { safeNextPath } from '@/lib/utils/safeNextPath'

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const origin = await getRequestOrigin()
  const next = safeNextPath(formData.get('next') as string | null)
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(next)}`
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      scopes: 'openid email profile',
      queryParams: { prompt: 'select_account', access_type: 'offline' },
    },
  })
  if (error || !data.url) {
    redirect('/auth/error')
  }
  redirect(data.url)
}
