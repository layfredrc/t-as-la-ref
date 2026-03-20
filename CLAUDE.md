# CLAUDE.md — T'as la ref ?

> Lis ce fichier entièrement avant chaque session. C'est la source de vérité du projet.

---

## Vision

**"T'as la ref ?"** est la bibliothèque vivante des références internet francophones.
Urban Dictionary × TikTok, en français. Une ref est amorcée par son auteur, complétée par la communauté.
Le contenu est généré par les utilisateurs — pas par des éditeurs.

---

## Stack

| Couche                 | Techno                                                 |
| ---------------------- | ------------------------------------------------------ |
| Framework              | Next.js 14+ App Router                                 |
| Styling                | Tailwind CSS + ShadCN UI                               |
| Data fetching          | TanStack Query                                         |
| Base de données + Auth | Supabase (tout — refs, tags, likes, comments, profils) |
| Déploiement            | Vercel                                                 |

**Règles :**

- App Router uniquement (`app/`), jamais le Pages Router
- Server Components par défaut — `"use client"` seulement si nécessaire
- Supabase côté serveur : `createServerClient` (`@supabase/ssr`)
- Supabase côté client : `createBrowserClient` (`@supabase/ssr`)
- `SUPABASE_SERVICE_ROLE_KEY` jamais exposé côté client

---

## Structure

```
app/
  (auth)/             # login, onboarding
  feed/               # feed principal
  ref/[slug]/         # page détail
  ajouter/            # flow ajout multi-step
  profil/[username]/  # profil utilisateur
  api/
    refs/create/      # POST
    refs/[id]/like/   # POST
    comments/         # POST
components/
  ui/                 # ShadCN — ne pas modifier
  ref/                # RefCard, RefPlayer, MediaEmbed, AddRefForm...
  layout/             # Navbar, Sidebar
lib/
  supabase/           # server.ts + browser.ts
  utils/
    detectMediaType.ts
    generateSlug.ts
    embedUrl.ts
```

---

## Schéma Supabase

```sql
-- Refs
CREATE TABLE refs (
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
CREATE TABLE tags (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  type  TEXT CHECK (type IN ('type_ref','origine','vibe')),
  emoji TEXT,
  slug  TEXT UNIQUE NOT NULL
);

-- Relation refs <-> tags
CREATE TABLE refs_tags (
  ref_id UUID REFERENCES refs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (ref_id, tag_id)
);

-- Dérivés (max 3 par ref)
CREATE TABLE refs_derives (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id     UUID REFERENCES refs(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  media_type TEXT,
  position   INT DEFAULT 0
);

-- Likes (1 par user par ref)
CREATE TABLE likes (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_id     UUID REFERENCES refs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, ref_id)
);

-- Commentaires / thread
CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_id     UUID REFERENCES refs(id) ON DELETE CASCADE,
  auteur_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content    TEXT NOT NULL CHECK (char_length(content) <= 1000),
  parent_id  UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profils (table existante dans le projet : `users`, pas `profiles`)
-- NE PAS recréer — cette table existe déjà sous le nom `users`
-- Champs : id, username, profile_picture, email, created_at
```

---

## Taxonomie des tags (seed)

### type_ref — Ce que c'est

| slug                | label                   | emoji |
| ------------------- | ----------------------- | ----- |
| scene-culte         | Scène culte             | 🎬    |
| phrase-punchline    | Phrase / Punchline      | 🗣️    |
| reaction            | Réaction / Expression   | 👀    |
| challenge-viral     | Challenge viral         | 🕺    |
| objet-vetement-lieu | Objet / Vêtement / Lieu | 🧢    |
| son-musique         | Son / Musique           | 🔊    |
| format-meme         | Format de meme          | 🤣    |
| evenement           | Événement               | 🌍    |

### origine — D'où ça vient

| slug          | label           | emoji |
| ------------- | --------------- | ----- |
| frenchcore    | FrenchCore      | 🇫🇷    |
| us-anglophone | US / Anglophone | 🇺🇸    |
| jp-anime      | JP / Anime      | 🇯🇵    |
| gaming        | Gaming          | 🎮    |
| sport         | Sport           | 🏀    |
| rap-musique   | Rap / Musique   | 🎵    |
| tv-medias     | Télé / Médias   | 📺    |
| internet-pur  | Internet pur    | 🌐    |
| irl-rue       | IRL / Rue       | 🏙️    |

### vibe — Qui capte

| slug               | label              | emoji |
| ------------------ | ------------------ | ----- |
| ultra-niche        | Ultra-niche        | 🔐    |
| gen-z              | Gen Z              | ⚡    |
| millennial         | Millennial         | 📟    |
| grand-public       | Grand public       | 📡    |
| intergenerationnel | Intergénérationnel | 🌈    |

---

## Flow d'ajout — Specs

### Parcours

```
Clic "Ajouter" → guard auth (/login si non connecté) → /ajouter
  Step 1 : Média    — URL + détection auto + embed preview
  Step 2 : La ref   — titre + type + origine + vibe + contexte
  Step 3 : Dérivés  — optionnel, skippable, max 3 URLs
  Preview           — rendu exact de la RefCard
  Submit            — POST /api/refs/create → redirect /ref/[slug]
```

### Step 1 — Média

- Champ URL unique, autofocus, paste-friendly
- Détection `media_type` via regex sur l'URL (voir `detectMediaType.ts`)
- Badge coloré du réseau détecté : YouTube 🔴 / TikTok 🖤 / Twitter/X ⚫ / Instagram 🟣
- Preview embed instantanée sous le champ
- Erreur fun si URL non reconnue : "On capte pas la ref..."

### Step 2 — La ref

- **Titre** : input, 60 chars max, compteur live
- **Type de ref** : grid de cards emoji, sélection unique, obligatoire
- **Origine** : grid de cards emoji, sélection unique, obligatoire
- **Vibe** : grid de cards emoji, sélection unique, obligatoire
- **Contexte** : textarea optionnel, 500 chars, placeholder engageant
- Le réseau de circulation EST DÉTECTÉ AUTOMATIQUEMENT depuis l'URL step 1 — ne pas le demander

### Step 3 — Dérivés (skip possible)

- Max 3 URLs additionnelles
- Preview thumbnail pour chaque URL valide
- Bouton "Passer" très visible, sans friction

### Preview finale

- Rendu exact de la `RefCard` telle qu'elle apparaît dans le feed
- Récap des 3 tags sélectionnés (pills)
- Bouton "Publier la ref 🚀"

### API POST /api/refs/create

```typescript
// Body
{
  titre: string
  media_url: string
  media_type: 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'video'
  thumbnail?: string
  contexte?: string
  score_culture?: 'inconnu' | 'gen-z' | 'cultissime'
  tag_ids: string[]      // UUIDs (obligatoire, min 3 — un de chaque axe)
  derives?: string[]     // URLs (max 3, optionnel)
}
// Steps serveur :
// 1. Vérifier session → 401 si absent
// 2. generateSlug(titre) → vérifier unicité → suffix si collision
// 3. INSERT refs → récupérer id
// 4. INSERT refs_tags (boucle tag_ids)
// 5. INSERT refs_derives (boucle derives)
// 6. Return { slug }
```

---

## Utilitaires

### `lib/utils/detectMediaType.ts`

```typescript
const patterns: Record<string, RegExp> = {
  youtube: /youtube\.com\/watch|youtu\.be\//,
  tiktok: /tiktok\.com\/@.+\/video/,
  twitter: /twitter\.com\/.+\/status|x\.com\/.+\/status/,
  instagram: /instagram\.com\/(p|reel|tv)\//,
}
export function detectMediaType(url: string): string | null
```

### `lib/utils/embedUrl.ts`

```
youtube   → https://www.youtube.com/embed/{videoId}
tiktok    → oEmbed API officielle
twitter   → <blockquote class="twitter-tweet"> + widget.js async (une seule fois)
instagram → oEmbed API
fallback  → lien externe + thumbnail générique
```

### `lib/utils/generateSlug.ts`

```
"OH PTN LAURENT" → "oh-ptn-laurent"
Translittérer accents, lowercase, tirets
Vérifier unicité en DB → ajouter suffix -2, -3... si collision
```

---

## Design system

Voir Design Token !

- Fonts : Rader Italic Bold (titres) / Supply Mono (labels) / Satoshi (corps)
- Mobile-first systématiquement
- États loading / error / empty toujours gérés
- Micro-animations Tailwind (`transition`, `hover:scale-*`)
- Le formulaire multi-step ne reload jamais la page

---

## Règles de code

1. Pas de `any` TypeScript
2. Logique métier dans `lib/`, pas dans les composants
3. Toujours gérer loading / error / empty
4. Mobile-first
5. Jamais de secrets côté client
6. Commits : `feat:` `fix:` `refactor:` `chore:`

---

## Env vars (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Ordre de dev

- [ ] Session 1 — Migrations SQL + seed tags
- [ ] Session 2 — `detectMediaType` + `embedUrl` + composant `MediaEmbed`
- [ ] Session 3 — Flow `/ajouter` multi-step (Step 1 → 2 → 3 → Preview)
- [ ] Session 4 — Route API `POST /api/refs/create`
- [ ] Session 5 — Feed connecté Supabase
- [ ] Session 6 — Page `/ref/[slug]` (embed + likes + comments)

---

---

## Figma MCP — Règles d'intégration

### Flow obligatoire (ne pas sauter d'étape)

1. `get_design_context` en premier — récupérer la représentation structurée du nœud ciblé
2. Si la réponse est trop large, utiliser `get_metadata` pour la carte haut niveau, puis re-fetcher seulement les nœuds nécessaires
3. `get_screenshot` pour la référence visuelle
4. Une fois les deux en main, télécharger les assets si besoin et démarrer l'implémentation
5. Traduire l'output Figma (React + Tailwind) dans les conventions du projet
6. Valider visuellement contre le screenshot avant de considérer la tâche terminée

### Composants

- **IMPORTANT** : Toujours chercher d'abord dans `components/ref/` et `components/ui/` avant de créer un nouveau composant
- Les composants ShadCN sont dans `components/ui/` — **ne jamais les modifier**
- Les nouveaux composants liés aux refs vont dans `components/ref/`
- Les composants de layout vont dans `components/layout/`
- Nommage : PascalCase, export nommé

### Tokens de couleur

Les couleurs sont définies comme variables CSS dans `app/globals.css`. **Ne jamais hardcoder de hex.**

| Variable         | Valeur    | Usage                           |
| ---------------- | --------- | ------------------------------- |
| `var(--bg)`      | `#edf1e8` | Background principal            |
| `var(--bg2)`     | `#d7dbd2` | Background secondaire           |
| `var(--fg)`      | `#141414` | Texte principal                 |
| `var(--accent1)` | `#ed6a5a` | Rouge/corail — CTA, alertes     |
| `var(--accent2)` | `#f4f1bb` | Jaune crème — highlights        |
| `var(--accent3)` | `#9bc1bc` | Teal — éléments secondaires     |
| `var(--accent4)` | `#5d576b` | Violet sombre                   |
| `var(--accent5)` | `#b6a6fe` | Violet clair — accent principal |

Utiliser les classes utilitaires Tailwind custom : `.bg-bg`, `.bg-fg`, `.text-fg`, `.bg-accent1`…`.bg-accent5`, `.text-accent1`…`.text-accent5`

### Typographie

- **Titres** : `font-family: 'PPRader'` → classe `.font-rader` ou `.font-pprader`, toujours `uppercase`, `line-height: 0.95`
- **Labels / mono** : `font-family: 'Supply Mono'` → classe `.font-supplymono`
- **Corps** : `font-family: 'Satoshi'`
- **IMPORTANT** : Ne jamais installer de nouvelles polices — les trois sont déjà chargées via `@font-face` dans `globals.css`

### Styling

- Tailwind CSS utility classes en priorité
- Variables CSS pour les couleurs du design system (pas de classes Tailwind `text-red-500` pour les couleurs projet)
- Utilitaire `.shadow-badge` disponible pour l'ombre `-8px 8px 0 #000`
- Utilitaire `.badge` disponible pour les capsules avec bordure + ombre
- Mobile-first systématiquement (`sm:`, `md:`, `lg:`)
- Micro-animations : `transition`, `hover:scale-*` Tailwind

### Assets

- **IMPORTANT** : Si le Figma MCP retourne une URL `localhost` pour une image ou SVG, l'utiliser directement
- **IMPORTANT** : Ne pas installer de nouvelles librairies d'icônes
- Assets statiques dans `public/`

### Règles de traduction Figma → code

- L'output Figma (React + Tailwind) est une **référence**, pas du code final
- Remplacer les classes Tailwind de couleur par les variables CSS du projet
- Remplacer les `font-family` inline par les classes utilitaires (`.font-rader`, `.font-supplymono`)
- S'assurer que le composant est un Server Component si possible, `"use client"` seulement si nécessaire
- Pas de `any` TypeScript

## Décisions techniques majeures

### Feed — Swiper + react-player v3

- Feed utilise Swiper (vertical, mousewheel + keyboard modules)
- Pas de CSS snap scroll (double scrollbar), pas d'IntersectionObserver
- Pattern isActive → mount dans RefCard pour éviter les CSP violations
- react-player v3 : prop `src` (pas `url`), web components à importer
  explicitement (`youtube-video-element`, `tiktok-video-element`...)
- Ne jamais contrôler le son depuis le parent — laisser le widget gérer

_Mars 2026_
