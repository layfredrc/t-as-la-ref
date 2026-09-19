import { extractYoutubeId, type MediaType } from './detectMediaType'

export type EmbedConfig =
  | { type: 'iframe'; src: string }
  | { type: 'twitter'; tweetUrl: string }
  | { type: 'instagram'; postUrl: string }
  | { type: 'player'; url: string }
  | { type: 'unsupported' }

export function getEmbedConfig(url: string, mediaType: MediaType): EmbedConfig {
  switch (mediaType) {
    case 'youtube': {
      const id = extractYoutubeId(url)
      if (!id) return { type: 'unsupported' }
      return { type: 'iframe', src: `https://www.youtube.com/embed/${id}` }
    }
    case 'tiktok':
      return { type: 'player', url }
    case 'twitter':
      return { type: 'twitter', tweetUrl: url }
    case 'instagram':
      return { type: 'instagram', postUrl: url }
    case 'video':
      return { type: 'player', url }
    default:
      return { type: 'unsupported' }
  }
}
