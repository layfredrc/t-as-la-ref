import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'

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

    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('user_profile_picture')
      .upload(fileName, file)

    if (!error && data?.path) {
      const { data: publicUrl } = supabase.storage
        .from('user_profile_picture')
        .getPublicUrl(data.path)
      setAvatarUrl(publicUrl.publicUrl)
    }
  }

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('users')
      .update({
        username,
        ...(avatarUrl !== '/default-avatar.png' && { profile_picture: avatarUrl }),
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Une erreur est survenue, veuillez reessayer.')
    }
    toast.info('Votre profil à été complété !')
    onComplete()
  }

  return (
    <Dialog open>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Complète ton profil</DialogTitle>
        </DialogHeader>

        {/* Ligne avatar + bouton */}
        <div className='flex items-center gap-4 mb-6'>
          <Avatar className='h-16 w-16 rounded-lg'>
            <AvatarImage src={!!avatarUrl ? avatarUrl : username} alt={username} />
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
        <div className='flex flex-col gap-3'>
          <Input
            placeholder="Nom d'utilisateur"
            value={username}
            accept='image/png, image/jpeg, image/jpg, image/webp'
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={!username}>
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
