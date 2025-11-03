import AnimatedCopy from '@/components/AnimatedCopy'
import Hero from '@/components/Hero/Hero'
import Manifest from '@/components/Manifest/Manifest'
import MemeVortex from '@/components/MemeVortex/MemeVortex'
import Navbar from '@/components/Navbar/Navbar'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const email = cookieStore.get('otp_email')?.value || null

  console.log(email, cookieStore)

  return (
    <>
      <Navbar />
      <Hero />
      <Manifest />
      <MemeVortex />
    </>
  )
}
