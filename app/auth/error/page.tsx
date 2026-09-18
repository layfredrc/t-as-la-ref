import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center'>
      <h1 className='font-rader text-4xl uppercase leading-[0.95]'>Ça a pas pris</h1>
      <p className='font-supplymono text-sm text-fg/70'>
        La connexion a échoué ou le lien a expiré. Réessaie.
      </p>
      <Link
        href='/login'
        className='rounded-lg border-2 border-black bg-accent5 px-4 py-2 font-supplymono text-sm shadow-[-4px_4px_0_#000] transition-transform hover:translate-y-0.5'
      >
        Retour à la connexion
      </Link>
    </main>
  )
}
