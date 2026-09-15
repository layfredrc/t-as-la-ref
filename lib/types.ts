import type { MediaType } from './utils/detectMediaType'

export type { MediaType }

export type MediaSourceType =
  | 'video'
  | 'tweet'
  | 'audio'
  | 'expression'
  | 'location'
  | 'image'
  | 'outfit'

export type UserProfile = {
  username: string
  profile_picture: string
  email: string
}

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

export interface LikeState {
  liked: boolean
  likes_count: number
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
  comments_count: number
  drole_score: number
  importance_score: number
  tags?: Tag[]
  author?: RefAuthor | null
}

export interface RefComment {
  id: string
  ref_id: string
  auteur_id: string | null
  content: string
  parent_id: string | null
  created_at: string
  author: RefAuthor | null
  /** true si le commentaire appartient à l'utilisateur courant (calculé côté serveur) */
  is_mine: boolean
}

/** Commentaire racine avec ses réponses directes, tel qu'affiché dans le thread. */
export interface CommentThread extends RefComment {
  replies: RefComment[]
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
  hashtags?: string[]
  drole_score?: number
  importance_score?: number
}

// Local form state across the multi-step flow
export interface AddRefFormData {
  // Step 1
  mediaSource: MediaSourceType | null
  media_url: string
  media_type: MediaType | null
  // Step 2
  titre: string
  contexte: string
  tag_type_ref: string | null
  tag_origine: string | null
  tag_vibe: string | null
  drole_score: number
  importance_score: number
  // Step 3
  derives: string[]
  // Step 2 — free-form hashtags
  hashtags: string[]
}
