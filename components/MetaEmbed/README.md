# Composant Meta oEmbed (Instagram / Facebook)

## Vue d'ensemble

`MetaEmbed` et `MetaEmbedField` permettent d'afficher dynamiquement un post Instagram ou Facebook via l'API officielle Meta oEmbed.
Le jeton d'application reste côté serveur (route `/api/meta-oembed`) et la prévisualisation affiche les messages d'erreur en cas de
compte non autorisé ou de post privé.

## Configuration requise

- Créez un app token Meta et exposez-le côté serveur :

```
META_OEMBED_APP_TOKEN="{APP_ID}|{APP_SECRET}"
```

- Pour restreindre la feature aux testeurs tant que la Business Verification / App Review n'est pas validée :

```
META_OEMBED_RESTRICTED=true
META_OEMBED_TESTER_EMAILS="dev1@exemple.com,dev2@exemple.com"
```

Quand `META_OEMBED_RESTRICTED=true`, un utilisateur connecté doit appartenir à la liste `META_OEMBED_TESTER_EMAILS`. Si la liste
est vide, tout utilisateur authentifié est accepté.

## Usage rapide

```tsx
import { MetaEmbedField } from '@/components/MetaEmbed/MetaEmbed'

export default function Example() {
  return <MetaEmbedField />
}
```

### Utilisation directe du composant

```tsx
import { MetaEmbed } from '@/components/MetaEmbed/MetaEmbed'

<MetaEmbed url="https://www.instagram.com/p/abc123/" />
```

## Notes de debug

- Les posts privés ou issus de comptes non autorisés renvoient une erreur JSON affichée dans le composant.
- Le HTML retourné contient les scripts officiels. Le composant charge les SDK Instagram/Facebook si nécessaire et relance
  `instgrm.Embeds.process()` ou `FB.XFBML.parse()` après rendu.
- Le cache est désactivé (`cache: 'no-store'`) sur la route API afin de refléter immédiatement les permissions Meta.
