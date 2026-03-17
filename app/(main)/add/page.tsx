import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AddRefForm } from '@/components/ref/AddRefForm'
export default async function AjouterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className='px-4 py-12'>
      <AddRefForm />
    </main>
  )
}
