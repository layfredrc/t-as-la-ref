'use client'

import { cn } from '@/lib/utils'
import { DialogContent, DialogDescription, DialogHeader } from './ui/dialog'
import { DialogTitle } from '@radix-ui/react-dialog'
import Image from 'next/image'
import { LoginFormContent } from './login-form-content'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
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
      <LoginFormContent />
    </DialogContent>
  )
}
