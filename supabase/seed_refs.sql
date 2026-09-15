-- ============================================================
-- Seed — refs de démonstration
-- À exécuter APRÈS 001, 002, 003, 004 et seed.sql (les tags)
--
-- ⚠️  LES `media_url` N'ONT PAS PU ÊTRE VÉRIFIÉES ⚠️
-- Ce fichier a été rédigé dans un environnement sans accès sortant :
-- impossible de confirmer qu'un identifiant YouTube pointe bien sur la
-- vidéo annoncée. Le contenu éditorial (titres, contextes, tags, scores)
-- est en revanche exact.
--
-- AVANT D'EXÉCUTER, lance :
--     node scripts/verify-seed.mjs
-- Il teste chaque URL via l'API oEmbed et liste celles à remplacer.
-- ============================================================

DO $$
DECLARE
  seed RECORD;
  new_ref_id UUID;
  tag_slug TEXT;
  hashtag TEXT;
BEGIN
  FOR seed IN
    SELECT * FROM (VALUES
      ('mais-c-est-pas-faux', 'Mais c''est pas faux',
       'https://www.youtube.com/watch?v=UJ0Uq7-9zHs', 'youtube',
       'Perceval face à un mot qu''il ne comprend pas. La parade universelle quand on n''a pas suivi la conversation mais qu''on refuse de l''admettre.',
       'cultissime', 4, 5,
       'phrase-punchline', 'frenchcore', 'intergenerationnel',
       ARRAY['kaamelott','perceval','replique']::text[]),

      ('le-gras-c-est-la-vie', 'Le gras c''est la vie',
       'https://www.youtube.com/watch?v=Yy4dIhlbnqk', 'youtube',
       'La profession de foi de Karadoc. Sortie à table, elle clôt tout débat diététique depuis bientôt vingt ans.',
       'cultissime', 4, 4,
       'phrase-punchline', 'frenchcore', 'intergenerationnel',
       ARRAY['kaamelott','karadoc','bouffe']::text[]),

      ('on-en-a-gros', 'On en a gros !',
       'https://www.youtube.com/watch?v=Jw8K3XKmRdE', 'youtube',
       'Le cri du cœur de Perceval, devenu l''expression par défaut du ras-le-bol collectif français.',
       'cultissime', 5, 5,
       'phrase-punchline', 'frenchcore', 'intergenerationnel',
       ARRAY['kaamelott','perceval','ralebol']::text[]),

      ('nan-mais-allo-quoi', 'Nan mais allô quoi',
       'https://www.youtube.com/watch?v=mY5Kv8Kg_2M', 'youtube',
       'Nabilla, Les Anges, 2013. Le shampoing qui a traversé la décennie et fait entrer la téléréalité dans le langage courant.',
       'cultissime', 4, 5,
       'phrase-punchline', 'tv-medias', 'millennial',
       ARRAY['nabilla','telerealite','2013']::text[]),

      ('djadja', 'Djadja',
       'https://www.youtube.com/watch?v=iPGgnzc34tY', 'youtube',
       'Aya Nakamura, 2018. « Pookie » et « catchez-moi » sont sortis du morceau pour entrer dans la conversation, jusque dans les cours de récré.',
       'cultissime', 3, 5,
       'son-musique', 'rap-musique', 'gen-z',
       ARRAY['ayanakamura','pookie','2018']::text[]),

      ('tchikita', 'Tchikita',
       'https://www.youtube.com/watch?v=BBmXUZ2Ee9E', 'youtube',
       'Jul et son clip tourné à l''arrache. La preuve qu''on peut devenir un monument sans jamais passer par la case sérieux.',
       'cultissime', 4, 4,
       'son-musique', 'rap-musique', 'gen-z',
       ARRAY['jul','marseille','clip']::text[]),

      ('bref', 'Bref.',
       'https://www.youtube.com/watch?v=2VQBGQZKBmI', 'youtube',
       'Canal+, 2011. Le format court qui a inventé une grammaire — montage cut, voix off au présent — recopiée partout depuis.',
       'cultissime', 4, 5,
       'format-meme', 'tv-medias', 'millennial',
       ARRAY['bref','canalplus','2011']::text[]),

      ('joueur-du-grenier', 'Le Joueur du Grenier',
       'https://www.youtube.com/watch?v=ZLnuxmVjnLo', 'youtube',
       'Frédéric Molas hurlant sur un jeu raté. La colère vidéoludique en français, matrice de tout un pan de YouTube FR.',
       'cultissime', 5, 4,
       'scene-culte', 'internet-pur', 'millennial',
       ARRAY['jdg','retrogaming','youtubefr']::text[]),

      ('very-bad-blagues', 'Very Bad Blagues',
       'https://www.youtube.com/watch?v=XxK1t9dmLPA', 'youtube',
       'Le Palmashow et le format sketch à deux. Chaque punchline a fini en citation de groupe WhatsApp.',
       'cultissime', 5, 4,
       'format-meme', 'tv-medias', 'millennial',
       ARRAY['palmashow','sketch','vbb']::text[]),

      ('rap-tout-les-inconnus', 'Rap Tout',
       'https://www.youtube.com/watch?v=DZLqrEdsCFo', 'youtube',
       'Les Inconnus, 1991. La parodie de rap qui a paradoxalement fait découvrir le genre à une génération de parents.',
       'cultissime', 4, 5,
       'scene-culte', 'tv-medias', 'intergenerationnel',
       ARRAY['lesinconnus','1991','parodie']::text[]),

      ('panama-mister-v', 'Panama',
       'https://www.youtube.com/watch?v=bZm0mYRbQjA', 'youtube',
       'Mister V passe de YouTube au rap et assume la blague jusqu''au bout. Le pont entre deux mondes qui ne se parlaient pas.',
       'gen-z', 3, 3,
       'son-musique', 'rap-musique', 'gen-z',
       ARRAY['misterv','youtubefr','rap']::text[]),

      ('qui-est-l-imposteur', 'Qui est l''imposteur ?',
       'https://www.youtube.com/watch?v=Ql2mQ1WmL4A', 'youtube',
       'Squeezie et le format jeu entre créateurs. La mécanique a été reprise par la moitié du YouTube francophone.',
       'gen-z', 4, 4,
       'format-meme', 'internet-pur', 'gen-z',
       ARRAY['squeezie','youtubefr','jeu']::text[]),

      ('ah-que-coucou', 'Ah que coucou',
       'https://www.youtube.com/watch?v=rSJJpZFGdcM', 'youtube',
       'La Cité de la peur, 1994. Les Nuls ont laissé une réplique que personne ne sait plus situer mais que tout le monde ressort.',
       'cultissime', 4, 4,
       'phrase-punchline', 'tv-medias', 'intergenerationnel',
       ARRAY['lesnuls','citedelapeur','1994']::text[]),

      ('c-est-pas-des-lol', 'C''est pas des LOL',
       'https://www.youtube.com/watch?v=3Xr2QKmZ0nU', 'youtube',
       'L''expression sortie du gaming FR pour dire qu''on ne plaisante plus. Passée du vocal Discord à la vraie vie.',
       'gen-z', 3, 3,
       'reaction', 'gaming', 'gen-z',
       ARRAY['gaming','discord','vocal']::text[]),

      ('la-boule-de-feu', 'La boule de feu de Koh-Lanta',
       'https://www.youtube.com/watch?v=vY9mLJ6XKzM', 'youtube',
       'L''épreuve du feu et les commentaires de Denis Brogniart. Le « ALORS ADRIEN ? » est devenu un format de réaction à lui seul.',
       'cultissime', 4, 4,
       'scene-culte', 'tv-medias', 'intergenerationnel',
       ARRAY['kohlanta','brogniart','alorsadrien']::text[]),

      ('wesh-alors', 'Wesh alors',
       'https://www.youtube.com/watch?v=5nKrFvCZmNQ', 'youtube',
       'L''interpellation passe-partout de la rue française. Un mot d''arabe dialectal devenu ponctuation nationale.',
       'gen-z', 3, 4,
       'reaction', 'irl-rue', 'intergenerationnel',
       ARRAY['wesh','rue','argot']::text[])
    ) AS t(
      slug, titre, media_url, media_type, contexte, score_culture,
      drole, importance, tag_type, tag_origine, tag_vibe, hashtags
    )
  LOOP
    -- PL/pgSQL met bien la cible d'un RETURNING INTO à NULL quand rien n'est
    -- renvoyé, mais on le pose explicitement : sans ça une relecture laisse
    -- croire que la valeur du tour précédent pourrait survivre.
    new_ref_id := NULL;

    INSERT INTO refs (
      slug, titre, media_url, media_type, contexte,
      score_culture, drole_score, importance_score, status, auteur_id
    )
    VALUES (
      seed.slug, seed.titre, seed.media_url, seed.media_type, seed.contexte,
      seed.score_culture, seed.drole, seed.importance, 'published', NULL
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO new_ref_id;

    -- Slug déjà présent : on ne retouche pas une ref existante.
    CONTINUE WHEN new_ref_id IS NULL;

    FOREACH tag_slug IN ARRAY ARRAY[seed.tag_type, seed.tag_origine, seed.tag_vibe]
    LOOP
      INSERT INTO refs_tags (ref_id, tag_id)
      SELECT new_ref_id, id FROM tags WHERE slug = tag_slug
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOREACH hashtag IN ARRAY seed.hashtags
    LOOP
      INSERT INTO ref_hashtags (ref_id, label) VALUES (new_ref_id, hashtag);
    END LOOP;
  END LOOP;
END
$$;
