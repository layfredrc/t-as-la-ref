import { InputOTPForm } from '@/components/InputOTPForm'
import { cookies } from 'next/headers'

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function AuthCallback({ searchParams }: Props) {
  const cookieStore = await cookies()
  const email = cookieStore.get('otp_email')?.value || null
  const { next } = await searchParams

  return (
    <div className='mt-20 text-center flex-col justify-center items-center content-center'>
      <InputOTPForm email={email} next={next} />
    </div>
  )
}
