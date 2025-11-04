import { createClient } from '@/utils/supabase/client'
import { InputOTPForm } from '@/components/InputOTPForm'
import { cookies } from 'next/headers'

export default async function AuthCallback() {
  const cookieStore = await cookies()
  const email = cookieStore.get('otp_email')?.value || null

  return (
    <div className='mt-20 text-center flex-col justify-center items-center content-center'>
      <InputOTPForm email={email} />
    </div>
  )
}
