export type MediaType = 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'video'

const patterns: Record<MediaType, RegExp> = {
  youtube: /youtube\.com\/watch|youtube\.com\/shorts\/|youtu\.be\//,
  tiktok: /tiktok\.com\/@.+\/video/,
  twitter: /twitter\.com\/.+\/status|x\.com\/.+\/status/,
  instagram: /instagram\.com\/(p|reel|tv)\//,
  video: /\.(mp4|webm|ogg)(\?.*)?$/i,
}

export function detectMediaType(url: string): MediaType | null {
  for (const [type, pattern] of Object.entries(patterns) as [MediaType, RegExp][]) {
    if (pattern.test(url)) return type
  }
  return null
}

export const mediaTypeLabels: Record<MediaType, { label: string; emoji: string; color: string }> = {
  youtube: { label: 'YouTube', emoji: '🔴', color: 'bg-red-600' },
  tiktok: { label: 'TikTok', emoji: '🖤', color: 'bg-zinc-900' },
  twitter: { label: 'Twitter / X', emoji: '⚫', color: 'bg-zinc-800' },
  instagram: { label: 'Instagram', emoji: '🟣', color: 'bg-purple-600' },
  video: { label: 'Vidéo', emoji: '🎬', color: 'bg-zinc-700' },
}
