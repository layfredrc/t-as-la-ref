import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AddRefForm } from '@/components/ref/AddRefForm'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { LoginForm } from '@/components/login-form'

export default async function AjouterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/feed')
  }

  return (
    <main className='min-h-screen bg-background px-4 py-12'>
      <AddRefForm />
    </main>
  )
}
