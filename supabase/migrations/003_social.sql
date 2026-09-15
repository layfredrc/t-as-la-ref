-- ============================================================
-- Migration 003 — T'as la ref ? — Boucle sociale (likes + comments)
-- À exécuter dans le Supabase SQL Editor, après 002_add_hashtags.sql
-- ============================================================

-- ── Compteur de commentaires sur refs ────────────────────────
ALTER TABLE refs ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0;

-- ── Index pour les lectures les plus fréquentes ──────────────
CREATE INDEX IF NOT EXISTS idx_likes_ref_id ON likes (ref_id);
CREATE INDEX IF NOT EXISTS idx_comments_ref_id_created ON comments (ref_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments (parent_id);

-- ============================================================
-- Triggers de compteurs
--
-- SECURITY DEFINER est obligatoire : la policy `refs_update_owner`
-- limite l'UPDATE sur refs à son auteur. Sans ça, un like posé par
-- quelqu'un d'autre que l'auteur ne mettrait jamais le compteur à jour.
-- ============================================================

CREATE OR REPLACE FUNCTION bump_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE refs SET likes_count = likes_count + 1 WHERE id = NEW.ref_id;
    RETURN NEW;
  ELSE
    UPDATE refs SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.ref_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_likes_count ON likes;
CREATE TRIGGER trg_likes_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION bump_likes_count();

CREATE OR REPLACE FUNCTION bump_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE refs SET comments_count = comments_count + 1 WHERE id = NEW.ref_id;
    RETURN NEW;
  ELSE
    UPDATE refs SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.ref_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_comments_count ON comments;
CREATE TRIGGER trg_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION bump_comments_count();

-- ── Policies manquantes sur comments ─────────────────────────
DROP POLICY IF EXISTS "comments_update_owner" ON comments;
CREATE POLICY "comments_update_owner" ON comments
  FOR UPDATE USING (auteur_id = auth.uid());

DROP POLICY IF EXISTS "comments_delete_owner" ON comments;
CREATE POLICY "comments_delete_owner" ON comments
  FOR DELETE USING (auteur_id = auth.uid());

-- ── Un commentaire ne peut répondre qu'à un commentaire ──────
-- de la même ref (garde-fou sur le thread).
CREATE OR REPLACE FUNCTION check_comment_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  parent_ref UUID;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT ref_id INTO parent_ref FROM comments WHERE id = NEW.parent_id;

  IF parent_ref IS NULL OR parent_ref <> NEW.ref_id THEN
    RAISE EXCEPTION 'parent_id doit appartenir à la même ref';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_parent ON comments;
CREATE TRIGGER trg_comment_parent
BEFORE INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION check_comment_parent();

-- ── Backfill des compteurs (idempotent) ──────────────────────
UPDATE refs r
SET likes_count = COALESCE((SELECT COUNT(*) FROM likes l WHERE l.ref_id = r.id), 0),
    comments_count = COALESCE((SELECT COUNT(*) FROM comments c WHERE c.ref_id = r.id), 0);
