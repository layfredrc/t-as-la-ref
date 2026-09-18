# T'as la ref ?

La bibliothèque vivante des références internet francophones. Next.js 15 (App
Router), Tailwind v4 + ShadCN, TanStack Query, Supabase. Les règles du projet
sont dans `CLAUDE.md`.

## Démarrer

```bash
npm install
cp .env.local.example .env.local   # voir les variables ci-dessous
npm run dev
```

Variables d'environnement (`.env.local`) :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
META_OEMBED_APP_TOKEN=            # optionnel — embeds Instagram / Facebook
```

## Scripts

| Commande             | Rôle                                                   |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Serveur de dev (Turbopack)                             |
| `npm run build`      | Build de production — TypeScript et ESLint bloquants   |
| `npm run lint`       | ESLint (règles Next + Prettier)                        |
| `npm run seed:check` | Vérifie les URLs de `supabase/seed-refs.json` (oEmbed) |
| `npm run seed:build` | Génère `supabase/seed_refs.sql` si tout est vert       |

## Base de données

Les migrations sont dans `supabase/migrations/`, à exécuter dans l'ordre
depuis le SQL Editor de Supabase. La dernière (`007_media_types.sql`) élargit
les types de média acceptés — sans elle, publier une ref Spotify, SoundCloud,
Facebook ou Google Maps échoue.

## Feed

`/feed?debug=1` affiche un panneau de diagnostic (élément sous le doigt,
paramètres de l'iframe, état du son, état interne de Swiper) pour lire sur un
vrai téléphone ce qu'aucune émulation ne dit.
