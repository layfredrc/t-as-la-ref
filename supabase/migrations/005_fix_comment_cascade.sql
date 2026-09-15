-- ============================================================
-- Migration 005 — Suppression d'un commentaire ayant des réponses
-- À exécuter après 004_barometres.sql
-- ============================================================

-- `comments.parent_id` référençait `comments(id)` sans action ON DELETE.
-- Supprimer un commentaire auquel quelqu'un avait répondu levait donc une
-- violation de clé étrangère (23503) : le bouton « Supprimer » renvoyait un
-- 500 dès qu'un thread existait.
--
-- CASCADE : supprimer un commentaire racine emporte ses réponses. Le trigger
-- de compteur étant FOR EACH ROW, il se déclenche aussi sur les lignes
-- supprimées en cascade et `comments_count` reste juste.
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_parent_id_fkey;

ALTER TABLE comments
  ADD CONSTRAINT comments_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;
