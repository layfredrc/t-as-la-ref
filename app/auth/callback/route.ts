import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/feed'
  if (!next.startsWith('/')) next = '/'

  const isLocalEnv = process.env.NODE_ENV === 'development'
  const defaultHost = isLocalEnv ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SITE_URL!

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('✅ Redirecting to:', `${defaultHost}${next}`)
      return NextResponse.redirect(`${defaultHost}${next}`)
    }
  }

  console.log('❌ Auth error, redirecting to:', `${defaultHost}/auth/auth-code-error`)
  return NextResponse.redirect(`${defaultHost}/auth/auth-code-error`)
}
