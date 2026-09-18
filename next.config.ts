import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Seules les images distantes du stockage Supabase (avatars) passent par
    // l'optimiseur. Le joker `*` précédent faisait de /_next/image un proxy
    // ouvert : n'importe qui pouvait y faire optimiser des images tierces,
    // facturées sur ce compte Vercel.
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
}

export default nextConfig
