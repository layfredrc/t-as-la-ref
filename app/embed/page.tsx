import { AudioEmbedField } from '@/components/AudioEmbed/AudioEmbedField'
import { TweetEmbedField } from '@/components/TweetEmbed/TweetEmbedField'

export default function EmbedPage() {
  return (
    <main className='flex min-h-screen w-full items-center justify-center bg-background px-6 py-12'>
      <div className='flex w-full max-w-6xl flex-col gap-8'>
        <header className='space-y-2'>
          <p className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>Prévisualisation des refs</p>
          <h1 className='text-3xl font-semibold leading-tight'>Tweets, tracks Spotify ou playlists SoundCloud en un copier/coller</h1>
          <p className='text-muted-foreground'>
            Collez l&apos;URL officielle et nous affichons automatiquement le widget embarqué pour que la ref soit visible
            immédiatement dans le feed.
          </p>
        </header>

        <div className='grid gap-6 lg:grid-cols-2'>
          <TweetEmbedField className='h-full' />
          <AudioEmbedField className='h-full' />
        </div>
      </div>
    </main>
  )
}
