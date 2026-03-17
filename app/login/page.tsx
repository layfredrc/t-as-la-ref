import Image from 'next/image'
import { LoginFormContent } from '@/components/login-form-content'

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams

  return (
    <main className='bg-bg min-h-screen flex items-center justify-center px-4'>
      <div className='w-full max-w-sm flex flex-col gap-6'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <Image
            src='/logo.png'
            alt='logo'
            width={69}
            height={69}
            className='rounded-xl'
            priority
          />
          <p className='text-fg/60 text-sm font-supplymono'>
            Connexion avec Google ou mot de passe OTP
          </p>
        </div>
        <LoginFormContent next={next} />
      </div>
    </main>
  )
}
