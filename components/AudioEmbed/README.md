# Composants Spotify & SoundCloud Embed

## Vue d'ensemble

Ces composants permettent de prévisualiser un morceau, un album ou une playlist Spotify/SoundCloud à partir d'un simple copier/coller du lien. La logique de détection est basée sur l'URL et utilise les widgets officiels de chaque plateforme.

## Composants

- `SpotifyEmbed`: affiche un iframe `open.spotify.com/embed/{type}/{id}` avec gestion du chargement et des erreurs.
- `SoundCloudEmbed`: affiche un iframe `w.soundcloud.com/player` avec personnalisation de la couleur.
- `AudioEmbedField`: champ complet pour coller le lien, ajouter une note perso et des tags, puis prévisualiser automatiquement le widget approprié.

## Utilisation rapide

```tsx
import { AudioEmbedField } from '@/components/AudioEmbed/AudioEmbedField'

export default function Example() {
  return <AudioEmbedField />
}
```

### Utilisation des embeds seuls

```tsx
import { SpotifyEmbed } from '@/components/AudioEmbed/SpotifyEmbed'
import { SoundCloudEmbed } from '@/components/AudioEmbed/SoundCloudEmbed'

<SpotifyEmbed url="https://open.spotify.com/track/0eGsygTp906u18L0Oimnem" />
<SoundCloudEmbed url="https://soundcloud.com/forss/flickermood" color="#1DB954" />
```

## Cas de test manuels

Testez les URLs suivantes dans le champ de prévisualisation :

- Spotify track : `https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b`
- Spotify playlist : `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`
- Spotify album : `https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy`
- SoundCloud track : `https://soundcloud.com/forss/flickermood`
- SoundCloud playlist : `https://soundcloud.com/johnfogerty/sets/the-long-road-home`
- Lien non supporté : `https://example.com/foo`

Les liens non publics ou mal formés doivent afficher un message d'erreur, tandis que les liens valides affichent le widget avec un loader pendant le chargement.

## Notes de conformité

- Les lecteurs intégrés utilisent uniquement les widgets officiels Spotify et SoundCloud (aucun scraping ou téléchargement audio).
- Les iframes sont chargées en `lazy` et encapsulées dans un wrapper responsive pour un rendu desktop/mobile.
