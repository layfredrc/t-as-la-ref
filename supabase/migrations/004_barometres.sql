-- ============================================================
-- Migration 004 — T'as la ref ? — Baromètres drôle / importance
-- À exécuter après 003_social.sql
-- ============================================================

ALTER TABLE refs
  ADD COLUMN IF NOT EXISTS drole_score INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS importance_score INT DEFAULT 3;

-- Les contraintes sont ajoutées à part : ADD CONSTRAINT IF NOT EXISTS
-- n'existe pas en Postgres, on passe par un bloc conditionnel pour que
-- la migration reste rejouable.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refs_drole_score_check'
  ) THEN
    ALTER TABLE refs
      ADD CONSTRAINT refs_drole_score_check CHECK (drole_score BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refs_importance_score_check'
  ) THEN
    ALTER TABLE refs
      ADD CONSTRAINT refs_importance_score_check CHECK (importance_score BETWEEN 1 AND 5);
  END IF;
END
$$;

-- Les refs déjà en base n'ont pas de score : on les met au milieu.
UPDATE refs SET drole_score = 3 WHERE drole_score IS NULL;
UPDATE refs SET importance_score = 3 WHERE importance_score IS NULL;
