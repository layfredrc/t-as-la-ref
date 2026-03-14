-- ============================================================
-- Seed — Tags taxonomie
-- À exécuter APRÈS la migration 001_init.sql
-- ============================================================

INSERT INTO tags (label, type, emoji, slug) VALUES
  -- type_ref — Ce que c'est
  ('Scène culte',           'type_ref', '🎬', 'scene-culte'),
  ('Phrase / Punchline',    'type_ref', '🗣️', 'phrase-punchline'),
  ('Réaction / Expression', 'type_ref', '👀', 'reaction'),
  ('Challenge viral',       'type_ref', '🕺', 'challenge-viral'),
  ('Objet / Vêtement / Lieu','type_ref','🧢', 'objet-vetement-lieu'),
  ('Son / Musique',         'type_ref', '🔊', 'son-musique'),
  ('Format de meme',        'type_ref', '🤣', 'format-meme'),
  ('Événement',             'type_ref', '🌍', 'evenement'),

  -- origine — D'où ça vient
  ('FrenchCore',            'origine',  '🇫🇷', 'frenchcore'),
  ('US / Anglophone',       'origine',  '🇺🇸', 'us-anglophone'),
  ('JP / Anime',            'origine',  '🇯🇵', 'jp-anime'),
  ('Gaming',                'origine',  '🎮', 'gaming'),
  ('Sport',                 'origine',  '🏀', 'sport'),
  ('Rap / Musique',         'origine',  '🎵', 'rap-musique'),
  ('Télé / Médias',         'origine',  '📺', 'tv-medias'),
  ('Internet pur',          'origine',  '🌐', 'internet-pur'),
  ('IRL / Rue',             'origine',  '🏙️', 'irl-rue'),

  -- vibe — Qui capte
  ('Ultra-niche',           'vibe',     '🔐', 'ultra-niche'),
  ('Gen Z',                 'vibe',     '⚡', 'gen-z'),
  ('Millennial',            'vibe',     '📟', 'millennial'),
  ('Grand public',          'vibe',     '📡', 'grand-public'),
  ('Intergénérationnel',    'vibe',     '🌈', 'intergenerationnel')

ON CONFLICT (slug) DO NOTHING;
