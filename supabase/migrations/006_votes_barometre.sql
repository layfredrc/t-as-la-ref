-- ============================================================
-- Migration 006 — T'as la ref ? — Vote communautaire sur les baromètres
-- À exécuter dans le Supabase SQL Editor, après 005_fix_comment_cascade.sql
--
-- Avant : `refs.drole_score` / `refs.importance_score` portaient la note
-- de l'auteur, figée à la création.
-- Après : ces deux colonnes deviennent la MOYENNE des votes de la
-- communauté, recalculée par trigger. Aucune lecture existante (feed,
-- page détail, types) n'a besoin de changer — elles lisent toujours les
-- mêmes colonnes, dont le sens s'élargit.
-- ============================================================

-- ── Un vote par utilisateur et par ref, modifiable ───────────
CREATE TABLE IF NOT EXISTS ref_votes (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_id     UUID REFERENCES refs(id) ON DELETE CASCADE,
  drole      INT NOT NULL CHECK (drole BETWEEN 1 AND 5),
  importance INT NOT NULL CHECK (importance BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, ref_id)
);

CREATE INDEX IF NOT EXISTS idx_ref_votes_ref_id ON ref_votes (ref_id);

ALTER TABLE refs ADD COLUMN IF NOT EXISTS votes_count INT DEFAULT 0;

-- ── RLS : lecture publique, écriture par son auteur ──────────
ALTER TABLE ref_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ref_votes_select_public" ON ref_votes;
CREATE POLICY "ref_votes_select_public" ON ref_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ref_votes_insert_auth" ON ref_votes;
CREATE POLICY "ref_votes_insert_auth" ON ref_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Le WITH CHECK est indispensable en plus du USING : sans lui, on pourrait
-- réassigner `user_id` à quelqu'un d'autre au cours d'un UPDATE.
DROP POLICY IF EXISTS "ref_votes_update_owner" ON ref_votes;
CREATE POLICY "ref_votes_update_owner" ON ref_votes
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ref_votes_delete_owner" ON ref_votes;
CREATE POLICY "ref_votes_delete_owner" ON ref_votes
  FOR DELETE USING (user_id = auth.uid());

-- ── Horodatage de la dernière modification du vote ───────────
CREATE OR REPLACE FUNCTION touch_ref_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ref_votes_touch ON ref_votes;
CREATE TRIGGER trg_ref_votes_touch
BEFORE UPDATE ON ref_votes
FOR EACH ROW EXECUTE FUNCTION touch_ref_vote();

-- ── Agrégat : moyenne des votes → colonnes de `refs` ─────────
-- SECURITY DEFINER pour la même raison que les compteurs de la 003 :
-- `refs_update_owner` réserve l'UPDATE sur refs à son auteur, or le vote
-- vient par définition de quelqu'un d'autre.
CREATE OR REPLACE FUNCTION refresh_ref_barometres()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target UUID := COALESCE(NEW.ref_id, OLD.ref_id);
BEGIN
  UPDATE refs r
  SET
    -- COALESCE : quand le dernier vote est supprimé, AVG vaut NULL. On garde
    -- alors la dernière moyenne connue plutôt que de violer le CHECK 1..5.
    drole_score      = COALESCE(agg.drole, r.drole_score),
    importance_score = COALESCE(agg.importance, r.importance_score),
    votes_count      = agg.n
  FROM (
    SELECT
      ROUND(AVG(drole))::INT      AS drole,
      ROUND(AVG(importance))::INT AS importance,
      COUNT(*)::INT               AS n
    FROM ref_votes
    WHERE ref_id = target
  ) agg
  WHERE r.id = target;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_ref_votes_aggregate ON ref_votes;
CREATE TRIGGER trg_ref_votes_aggregate
AFTER INSERT OR UPDATE OR DELETE ON ref_votes
FOR EACH ROW EXECUTE FUNCTION refresh_ref_barometres();

-- ── Backfill : la note posée à la création devient le vote de l'auteur ──
-- Idempotent : rejouer la migration ne réécrit pas un vote déjà modifié.
INSERT INTO ref_votes (user_id, ref_id, drole, importance)
SELECT auteur_id, id, COALESCE(drole_score, 3), COALESCE(importance_score, 3)
FROM refs
WHERE auteur_id IS NOT NULL
ON CONFLICT (user_id, ref_id) DO NOTHING;

UPDATE refs r
SET votes_count = COALESCE((SELECT COUNT(*) FROM ref_votes v WHERE v.ref_id = r.id), 0);
