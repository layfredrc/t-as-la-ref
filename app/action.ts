'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getRequestOrigin } from '@/lib/utils/getRequestOrigin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log({ data })
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  console.log({ data })
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithOTP(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const origin = await getRequestOrigin()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}`,
    },
  })

  if (error) {
    console.error('error', error)
    redirect('/error')
  }

  const cookieStore = await cookies()
  cookieStore.set('otp_email', email, {
    path: '/',
    maxAge: 600, // 10 minutes
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const origin = await getRequestOrigin()
  const next = formData.get('next') as string | null
  const callbackUrl = next
    ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    : `${origin}/auth/callback`
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      scopes: 'openid email profile',
      queryParams: { prompt: 'select_account', access_type: 'offline' },
    },
  })
  if (error) {
    redirect('/error')
  }
  redirect(data.url)
}
