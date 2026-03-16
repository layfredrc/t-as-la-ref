export type MediaType =
  | 'youtube'
  | 'tiktok'
  | 'twitter'
  | 'instagram'
  | 'spotify'
  | 'soundcloud'
  | 'facebook'
  | 'maps'
  | 'video'

const patterns: Record<MediaType, RegExp> = {
  youtube: /youtube\.com\/watch|youtube\.com\/shorts\/|youtu\.be\//,
  tiktok: /tiktok\.com\/@.+\/video/,
  twitter: /twitter\.com\/.+\/status|x\.com\/.+\/status/,
  instagram: /instagram\.com\/(p|reel|tv)\//,
  spotify: /open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist|episode|show)\//,
  soundcloud: /soundcloud\.com\/.+/,
  facebook: /facebook\.com\/(watch|reel|\w+\/videos\/)/,
  maps: /maps\.google\.com|google\.com\/maps|goo\.gl\/maps/,
  video: /\.(mp4|webm|ogg)(\?.*)?$/i,
}

export function detectMediaType(url: string): MediaType | null {
  for (const [type, pattern] of Object.entries(patterns) as [MediaType, RegExp][]) {
    if (pattern.test(url)) return type
  }
  return null
}

export const mediaTypeLabels: Record<MediaType, { label: string; emoji: string; color: string }> = {
  youtube:    { label: 'YouTube',      emoji: '🔴', color: 'bg-red-600' },
  tiktok:     { label: 'TikTok',       emoji: '🖤', color: 'bg-zinc-900' },
  twitter:    { label: 'Twitter / X',  emoji: '⚫', color: 'bg-zinc-800' },
  instagram:  { label: 'Instagram',    emoji: '🟣', color: 'bg-purple-600' },
  spotify:    { label: 'Spotify',      emoji: '🟢', color: 'bg-green-600' },
  soundcloud: { label: 'SoundCloud',   emoji: '🟠', color: 'bg-orange-500' },
  facebook:   { label: 'Facebook',     emoji: '🔵', color: 'bg-blue-600' },
  maps:       { label: 'Google Maps',  emoji: '📍', color: 'bg-blue-500' },
  video:      { label: 'Vidéo',        emoji: '🎬', color: 'bg-zinc-700' },
}
