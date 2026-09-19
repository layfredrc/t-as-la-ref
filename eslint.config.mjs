import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import prettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const config = [
  // Les règles Next (core-web-vitals + TypeScript) : sans elles, ESLint n'avait
  // même pas de parser TypeScript et échouait en « Parsing error » sur chaque
  // fichier — `npm run lint` ne vérifiait rien.
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  prettier,
  {
    // ShadCN : générés, jamais modifiés à la main (voir CLAUDE.md).
    ignores: ['components/ui/**', '.next/**', 'node_modules/**', 'scripts/**'],
  },
]

export default config
