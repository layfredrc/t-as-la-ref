-- ============================================================
-- Migration 007 — T'as la ref ? — Types de média élargis
-- À exécuter dans le Supabase SQL Editor, après 006_votes_barometre.sql
--
-- `detectMediaType` reconnaît neuf plateformes depuis longtemps (Spotify,
-- SoundCloud, Facebook, Google Maps en plus des cinq d'origine), mais la
-- contrainte CHECK de `refs.media_type` — et le schéma zod de
-- POST /api/refs/create — n'en acceptaient que cinq : publier une ref
-- Spotify échouait en 422. Les deux listes sont maintenant alignées sur
-- `lib/utils/detectMediaType.ts`.
-- ============================================================

ALTER TABLE refs DROP CONSTRAINT IF EXISTS refs_media_type_check;
ALTER TABLE refs ADD CONSTRAINT refs_media_type_check CHECK (
  media_type IN (
    'youtube', 'tiktok', 'twitter', 'instagram',
    'spotify', 'soundcloud', 'facebook', 'maps',
    'video'
  )
);
