import Hero from '@/components/Hero/Hero'
import Manifest from '@/components/Manifest/Manifest'
import MemeVortex from '@/components/MemeVortex/MemeVortex'
import Navbar from '@/components/Navbar/Navbar'

// Aucune lecture de cookies ici : la page est rendue statiquement et servie
// depuis le CDN. L'état de connexion (bouton « Connexion ») se lit côté client.
export default function Home() {
  return (
    <div className='page'>
      <Navbar />
      <Hero />
      <Manifest />
      <MemeVortex />
    </div>
  )
}
