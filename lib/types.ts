import type { MediaType } from './utils/detectMediaType'

export type { MediaType }

export interface Tag {
  id: string
  label: string
  type: 'type_ref' | 'origine' | 'vibe'
  emoji: string
  slug: string
}

export interface TagsByType {
  type_ref: Tag[]
  origine: Tag[]
  vibe: Tag[]
}

export interface RefAuthor {
  id: string
  username: string
  profile_picture: string | null
}

export interface Ref {
  id: string
  slug: string
  titre: string
  media_url: string
  media_type: MediaType
  thumbnail: string | null
  contexte: string | null
  score_culture: 'inconnu' | 'gen-z' | 'cultissime'
  status: 'pending' | 'published' | 'rejected'
  auteur_id: string | null
  created_at: string
  likes_count: number
  tags?: Tag[]
  author?: RefAuthor | null
}

export interface CreateRefBody {
  titre: string
  media_url: string
  media_type: MediaType
  thumbnail?: string
  contexte?: string
  score_culture?: 'inconnu' | 'gen-z' | 'cultissime'
  tag_ids: string[]
  derives?: string[]
}

// Local form state across the multi-step flow
export interface AddRefFormData {
  // Step 1
  media_url: string
  media_type: MediaType | null
  // Step 2
  titre: string
  contexte: string
  tag_type_ref: string | null
  tag_origine: string | null
  tag_vibe: string | null
  // Step 3
  derives: string[]
}
