'use client'

import React, { useEffect, useState } from 'react'
import ProfileSetupModal from './ProfileSetupModal'
import { useUserProfile } from '@/queryOptions/getUserProfile'
import { useQueryClient } from '@tanstack/react-query'

const OnboardingGuard: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const { data: userProfile, isLoading } = useUserProfile()
  const queryClient = useQueryClient()

  // Show modal only when the profile has been fetched and the username is missing
  useEffect(() => {
    if (isLoading) return

    // userProfile === null -> user not logged or no profile row; ignore (no modal)
    // userProfile exists and has no username -> show modal
    if (userProfile && !userProfile.username) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [isLoading, userProfile])

  // Called when ProfileSetupModal completes (user saved username/avatar)
  const handleComplete = async () => {
    // invalidate so useUserProfile refetches and the whole UI updates
    await queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    setShowModal(false)
  }

  return <>{showModal && <ProfileSetupModal onComplete={handleComplete} />}</>
}

export default OnboardingGuard
