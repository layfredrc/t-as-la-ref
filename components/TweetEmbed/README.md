# TweetEmbed

Composant client React pour prévisualiser un tweet/X à partir d'une URL collée par l'utilisateur. Il repose sur le widget officiel Twitter/X et charge le script `https://platform.twitter.com/widgets.js` uniquement lorsqu'une URL compatible est fournie.

## Utilisation rapide

```tsx
import { TweetEmbed } from '@/components/TweetEmbed/TweetEmbed'

<TweetEmbed url="https://x.com/username/status/123456" />
```

- `url` : lien complet du tweet à afficher (`https://x.com/.../status/<id>` ou `https://twitter.com/.../status/<id>`).
- `className` : classes utilitaires additionnelles si besoin.

Le composant affiche automatiquement :

- Un message d'aide tant qu'aucun lien n'est fourni.
- Un loader pendant le rendu du widget.
- Un message d'erreur explicite si l'URL est invalide ou si le tweet est privé/supprimé.

## Champ de saisie prêt à l'emploi

Le composant `TweetEmbedField` couple un champ "Coller le lien du post" et la prévisualisation :

```tsx
import { TweetEmbedField } from '@/components/TweetEmbed/TweetEmbedField'

<TweetEmbedField onSubmit={(url) => console.log('URL soumise', url)} />
```

Ce composant est utilisé sur la page `/embed` (voir `app/embed/page.tsx`) pour valider l'intégration visuelle et l'UX.

## Cas de test manuels

1. **URL valide** : collez une URL publique (ex. `https://x.com/TwitterDev/status/560070183650213889`) et vérifiez l'apparition du tweet avec ses médias.
2. **URL invalide ou hors Twitter/X** : collez un lien qui n'est pas un statut ; la prévisualisation affiche un message indiquant que l'URL n'est pas reconnue.
3. **Tweet privé/supprimé** : utilisez un tweet non public ; après le chargement, un message signale que le tweet ne peut pas être affiché.
4. **Chargement** : observez le spinner pendant la récupération du widget.

Ces scénarios couvrent les états principaux : aide initiale, succès d'embed, erreur d'URL et erreur de disponibilité du tweet.
