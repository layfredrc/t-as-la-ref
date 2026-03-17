import Image from 'next/image'
import { LoginFormContent } from '@/components/login-form-content'

type Props = {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams

  return (
    <main className='bg-background min-h-screen flex items-center justify-center px-4'>
      <div className='w-full max-w-sm flex flex-col gap-6'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <div
            className='
            flex items-center justify-center
            w-[112px] h-[60px]
            bg-white border-2 border-black
            rounded-[8px]
            shadow-[-4px_4px_0_#000]
          '
          >
            <Image
              src='/logo.png'
              alt='logo'
              width={69}
              height={69}
              className='rounded-xl'
              priority
            />
          </div>
          <p className='text-fg/60 text-sm font-supplymono'>
            Connexion avec Google ou mot de passe OTP
          </p>
        </div>
        <LoginFormContent next={next} />
      </div>
    </main>
  )
}
