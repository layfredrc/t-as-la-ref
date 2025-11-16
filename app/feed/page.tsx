'use client'

import OnboardingGuard from '@/components/OnboardingGuard'
import RefWrapper from '@/components/RefWrapper'
import { VideoPlayer } from '@/components/VideoPlayer/VideoPlayer'

const page = () => {
  return (
    <>
      <OnboardingGuard />
      <RefWrapper>
        <VideoPlayer url='https://youtube.com/shorts/ckjrQEG7fC0?si=TauthBPeIzmdZNuj' />
      </RefWrapper>
    </>
  )
}

export default page
