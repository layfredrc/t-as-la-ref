import eslintPluginPrettier from 'eslint-plugin-prettier'
import prettier from 'eslint-config-prettier'

export default [
  {
    plugins: { prettier: eslintPluginPrettier },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  prettier,
]
