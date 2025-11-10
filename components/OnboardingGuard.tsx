import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ProfileSetupModal from './ProfileSetupModal'
const OnboardingGuard = () => {
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single()

      console.log(data)

      if (!data?.username && !data?.username) {
        setShowModal(true)
      }
    }

    checkProfile()
  }, [])

  return <>{showModal && <ProfileSetupModal onComplete={() => setShowModal(false)} />}</>
}

export default OnboardingGuard
