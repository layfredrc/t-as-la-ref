'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { DialogContent, DialogDescription, DialogHeader } from './ui/dialog'
import { signInWithGoogle, signInWithOTP } from '@/app/action'
import { DialogTitle } from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { InputOTPForm } from './InputOTPForm'
import { toast } from 'sonner'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'EMAIL' | 'OTP_SENT'>('EMAIL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleSendOtp = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/otp`,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setStep('OTP_SENT')
      toast.info('Un code à été envoyé par e-mail.')
    }
  }

  return (
    <DialogContent className={cn('flex flex-col gap-6', className)} {...props}>
      <DialogHeader className='text-center'>
        <DialogTitle className='flex justify-center text-center'>
          <Image
            src='/logo.png'
            alt='logo'
            width={69}
            height={69}
            className='rounded-xl'
            priority
          />
        </DialogTitle>
        <DialogDescription className='text-center'>
          Connexion avec Google ou mot de passe OTP
        </DialogDescription>
      </DialogHeader>
      <form>
        <FieldGroup>
          <Field>
            <Button variant='outline' type='submit' formAction={signInWithGoogle}>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                <path
                  d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                  fill='currentColor'
                />
              </svg>
              Connexion avec Google
            </Button>
          </Field>

          <Field>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              id='email'
              type='email'
              name='email'
              placeholder='m@example.com'
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {error && <FieldDescription className='text-red-500'>{error}</FieldDescription>}
          <Field>
            <Button type='submit' formAction={handleSendOtp}>
              {loading ? 'Envoi...' : 'Recevoir un code'}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      {step === 'OTP_SENT' && (
        <div>
          <InputOTPForm email={email} />
        </div>
      )}
    </DialogContent>
  )
}
