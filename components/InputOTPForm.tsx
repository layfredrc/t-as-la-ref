'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Votre code OTP à 6 chiffres.',
  }),
})

type InputOTPFormProps = {
  email: string | null
}

export function InputOTPForm({ email }: InputOTPFormProps) {
  const router = useRouter()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!email) {
      toast.error('Email non saisi, veuillez réessayer.')
      router.push('/login')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: data.pin,
      type: 'email',
    })

    if (error) {
      toast.error(error.message || 'Invalid OTP.')
    } else {
      toast.success('Vous êtes connecté !')
      router.push('/feed')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mx-auto flex w-full max-w-md flex-col items-center space-y-6 text-center'
      >
        <FormField
          control={form.control}
          name='pin'
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} containerClassName='justify-center' {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className='h-12 w-12 text-lg' />
                    <InputOTPSlot index={1} className='h-12 w-12 text-lg' />
                    <InputOTPSlot index={2} className='h-12 w-12 text-lg' />
                    <InputOTPSlot index={3} className='h-12 w-12 text-lg' />
                    <InputOTPSlot index={4} className='h-12 w-12 text-lg' />
                    <InputOTPSlot index={5} className='h-12 w-12 text-lg' />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Entrez le code à usage unique envoyé sur votre boite de réception
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>Connexion</Button>
      </form>
    </Form>
  )
}
