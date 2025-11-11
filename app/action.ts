'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'

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
  const nextHeaders = await headers()
  const origin = nextHeaders.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL! // définis cette env en prod

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

export async function signInWithGoogle() {
  const supabase = await createClient()
  console.log(process.env.NODE_ENV)
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const origin = isLocalEnv ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SITE_URL! // définis cette env en prod
  console.log({ origin })
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: 'openid email profile',
      // Quelques options utiles :
      queryParams: { prompt: 'select_account', access_type: 'offline' },
    },
  })
  if (error) {
    redirect('/error')
  }
  console.log({ data })
  redirect(data.url)
}
