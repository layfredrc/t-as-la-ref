import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import { Field, FieldLabel } from './ui/field'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userProfileKey } from '@/queryOptions/getUserProfile'

export default function ProfileSetupModal({ onComplete }: { onComplete: () => void }) {
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png')

  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Seuls les fichiers image sont autorisés.')
      return
    }

    // Nom de fichier neutre : seule l'extension du fichier d'origine est
    // conservée, pas son nom (espaces, accents, chemins…).
    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
    const { data, error } = await supabase.storage
      .from('user_profile_picture')
      .upload(fileName, file)

    if (error || !data?.path) {
      toast.error("L'envoi de la photo a échoué. Réessaie.")
      return
    }

    const { data: publicUrl } = supabase.storage
      .from('user_profile_picture')
      .getPublicUrl(data.path)
    setAvatarUrl(publicUrl.publicUrl)
  }

  const isValidUsername = (value: string) => /^[a-zA-Z0-9_]{2,20}$/.test(value)

  const queryClient = useQueryClient()

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!isValidUsername(username)) {
        throw new Error(
          "Nom d'utilisateur invalide. Lettres, chiffres et _ uniquement, 2-20 caractères.",
        )
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existingUser) {
        throw new Error('Ce nom d’utilisateur est déjà pris.')
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur introuvable.')

      const { error } = await supabase
        .from('users')
        .update({
          username,
          ...(avatarUrl !== '/default-avatar.png' && { profile_picture: avatarUrl }),
        })
        .eq('id', user.id)

      if (error) {
        throw new Error('Erreur de mise à jour du profil.')
      }

      return true
    },
    onSuccess: async () => {
      toast.info('Votre profil a été complété !')
      await queryClient.invalidateQueries({ queryKey: userProfileKey })
      onComplete()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = async () => {
    updateUserMutation.mutate()
  }

  return (
    <Dialog open>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Complète ton profil</DialogTitle>
        </DialogHeader>

        {/* Ligne avatar + bouton */}
        <div className='flex items-center gap-4 mb-6'>
          <Avatar className='h-24 w-24 rounded-full'>
            <AvatarImage src={avatarUrl} alt={username} className='object-cover object-center' />
            <AvatarFallback className='rounded-lg'>REF</AvatarFallback>
          </Avatar>
          <div>
            <label className='cursor-pointer text-sm font-medium text-primary hover:underline'>
              Modifier la photo
              <Input
                type='file'
                id='picture'
                accept='image/*'
                className='hidden'
                onChange={handleUpload}
              />
            </label>
          </div>
        </div>

        {/* Input username */}
        <Field className='flex flex-col gap-3'>
          <FieldLabel htmlFor='username'>Nom d&apos;utilisateur</FieldLabel>
          <Input
            id='username'
            placeholder="Nom d'utilisateur"
            value={username}
            autoComplete='username'
            onChange={(e) => setUsername(e.target.value)}
          />
          {!isValidUsername(username) && username.length > 0 && (
            <p className='text-sm text-red-500'>
              Lettres, chiffres et _ uniquement, entre 2 et 20 caractères.
            </p>
          )}
          <Button onClick={handleSubmit} disabled={!username || updateUserMutation.isPending}>
            {updateUserMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Field>
      </DialogContent>
    </Dialog>
  )
}
