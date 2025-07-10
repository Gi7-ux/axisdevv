import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jestPlugin from 'eslint-plugin-jest'

export default tseslint.config(
  { ignores: ['dist', 'jest.config.js'] }, // Also ignore jest.config.js
  {
    // General TypeScript and React configuration
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Jest specific configuration
    files: ['**/*.test.{ts,tsx}'],
    ...jestPlugin.configs['flat/recommended'],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      // You can add or override Jest specific rules here if needed
      // e.g. 'jest/no-disabled-tests': 'warn',
    }
  }
)
