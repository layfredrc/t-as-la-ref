-- ============================================================
-- Migration 001 — T'as la ref ? — Init schema
-- À exécuter dans le Supabase SQL Editor
-- ============================================================

-- Refs
CREATE TABLE IF NOT EXISTS refs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  titre         TEXT NOT NULL CHECK (char_length(titre) <= 60),
  media_url     TEXT NOT NULL,
  media_type    TEXT CHECK (media_type IN ('youtube','tiktok','twitter','instagram','video')),
  thumbnail     TEXT,
  contexte      TEXT CHECK (char_length(contexte) <= 500),
  score_culture TEXT DEFAULT 'inconnu' CHECK (score_culture IN ('inconnu','gen-z','cultissime')),
  status        TEXT DEFAULT 'published' CHECK (status IN ('pending','published','rejected')),
  auteur_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  likes_count   INT DEFAULT 0
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  type  TEXT CHECK (type IN ('type_ref','origine','vibe')),
  emoji TEXT,
  slug  TEXT UNIQUE NOT NULL
);

-- Relation refs <-> tags
CREATE TABLE IF NOT EXISTS refs_tags (
  ref_id UUID REFERENCES refs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (ref_id, tag_id)
);

-- Dérivés (max 3 par ref)
CREATE TABLE IF NOT EXISTS refs_derives (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id     UUID REFERENCES refs(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  media_type TEXT,
  position   INT DEFAULT 0
);

-- Likes (1 par user par ref)
CREATE TABLE IF NOT EXISTS likes (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_id     UUID REFERENCES refs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, ref_id)
);

-- Commentaires / thread
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id     UUID REFERENCES refs(id) ON DELETE CASCADE,
  auteur_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content    TEXT NOT NULL CHECK (char_length(content) <= 1000),
  parent_id  UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE refs_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE refs_derives ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- refs : lecture publique, écriture authentifiée
CREATE POLICY "refs_select_public" ON refs FOR SELECT USING (true);
CREATE POLICY "refs_insert_auth" ON refs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "refs_update_owner" ON refs FOR UPDATE USING (auteur_id = auth.uid());
CREATE POLICY "refs_delete_owner" ON refs FOR DELETE USING (auteur_id = auth.uid());

-- tags : lecture publique uniquement
CREATE POLICY "tags_select_public" ON tags FOR SELECT USING (true);

-- refs_tags : lecture publique, écriture authentifiée
CREATE POLICY "refs_tags_select_public" ON refs_tags FOR SELECT USING (true);
CREATE POLICY "refs_tags_insert_auth" ON refs_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- refs_derives : lecture publique, écriture authentifiée
CREATE POLICY "refs_derives_select_public" ON refs_derives FOR SELECT USING (true);
CREATE POLICY "refs_derives_insert_auth" ON refs_derives FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- likes : lecture publique, écriture/suppression par son auteur
CREATE POLICY "likes_select_public" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_auth" ON likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete_owner" ON likes FOR DELETE USING (user_id = auth.uid());

-- comments : lecture publique, écriture authentifiée
CREATE POLICY "comments_select_public" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON comments FOR INSERT WITH CHECK (auteur_id = auth.uid());
