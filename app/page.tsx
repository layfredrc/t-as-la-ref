import AnimatedCopy from '@/components/AnimatedCopy'
import Hero from '@/components/Hero/Hero'
import Manifest from '@/components/Manifest/Manifest'
import MemeVortex from '@/components/MemeVortex/MemeVortex'
import Navbar from '@/components/Navbar/Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Manifest />
      <MemeVortex />
    </>
  )
}
