/**
 * Le titre du vortex en lettres « ANSI Shadow », le style des logos de k9s
 * et des bannières de terminal. Chaque glyphe fait six lignes de même
 * largeur ; les mots s'assemblent ligne à ligne, sans espace entre les
 * lettres (l'ombre ╗╝ en tient lieu).
 *
 * Rendu dans la police mono du système (voir MemeVortex.css) : c'est elle
 * qui garantit que `█` et `╗` ont exactement la largeur d'une lettre.
 */
const GLYPHS: Record<string, string[]> = {
  T: ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
  "'": ['██╗', '██║', '╚═╝', '   ', '   ', '   '],
  A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
  S: ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
  L: ['██╗     ', '██║     ', '██║     ', '██║     ', '███████╗', '╚══════╝'],
  R: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔══██╗', '██║  ██║', '╚═╝  ╚═╝'],
  E: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
  F: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '██║     ', '╚═╝     '],
  '?': ['██████╗ ', '╚════██╗', '  ▄███╔╝', '  ▀▀══╝ ', '  ██╗   ', '  ╚═╝   '],
  ' ': ['  ', '  ', '  ', '  ', '  ', '  '],
}

function banner(text: string) {
  return Array.from({ length: 6 }, (_, row) =>
    Array.from(text)
      .map((ch) => GLYPHS[ch][row])
      .join('')
      .trimEnd(),
  ).join('\n')
}

/** Sur une seule ligne, pour les fenêtres larges. */
export const ASCII_TITLE_LINE = banner("T'AS LA REF ?")

/** Deux lignes : « T'AS LA » puis « REF ? », 46 colonnes au plus (étroit). */
export const ASCII_LOGO = [banner("T'AS LA"), banner('REF ?')]

const widest = (blocks: string[]) =>
  Math.max(...blocks.flatMap((block) => block.split('\n').map((line) => line.length)))

/** Largeur de la plus longue ligne, en colonnes : sert au calcul de taille. */
export const ASCII_LOGO_COLS = widest(ASCII_LOGO)
export const ASCII_TITLE_LINE_COLS = widest([ASCII_TITLE_LINE])

/**
 * Le logo « @Ref » (public/logo.png) en quadrants ▘ ▝ ▖ ▗ ▚ ▞ ▛ ▜ ▙ ▟ :
 * quatre pixels (2 × 2) par caractère, d'où des courbes plus douces qu'en
 * demi-blocs. Généré une fois depuis le PNG avec sharp (20 colonnes, seuil
 * 160), puis figé ici : rien ne se calcule à l'exécution.
 */
export const ASCII_BRAND = [
  '   ▄▟████▙▄',
  ' ▗█▛▘    ▝▜▙▖   ▗▟█▙',
  '▗█▘ ▟███▙  ▜▙   █▛',
  '▟▛  █   █▌ ▐█  ▐█▄▄',
  '█▌  █▄▄█▀  ▟▛ ▀█▛▀▘',
  '█▌  █▘▝█▄▄▟▛▘  ▟▌',
  '▜▌ ▐█   ▀▀▘▗██ █▌',
  '▝█▖ ▀     ▗█▟▛▗█▘',
  ' ▝█▄▖    ▄▟█▘ ▟▛',
  '   ▀▜████▀▀▜██▀',
].join('\n')

export const ASCII_BRAND_COLS = widest([ASCII_BRAND])
