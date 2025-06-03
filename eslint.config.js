const eslint = require('@eslint/js')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const nodePlugin = require('eslint-plugin-node')
const importPlugin = require('eslint-plugin-import')
const path = require('path')
const globals = require('globals')
const { fixupPluginRules } = require('@eslint/compat')

/** @type {import('eslint').Linter.Config} */
module.exports = [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        NodeJS: 'readonly',
        Express: 'readonly',
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        module: true,
        require: true,
        process: true,
        __dirname: true,
        __filename: true
      },
      parser: tsParser,
      parserOptions: {
        project: path.resolve(__dirname, 'tsconfig.eslint.json'),
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      '@typescript-eslint': fixupPluginRules(tsPlugin),
      node: fixupPluginRules(nodePlugin),
      import: fixupPluginRules(importPlugin)
    },
    ignores: ['**/*.d.ts'],
    rules: {
      indent: 'off',
      quotes: 'off',
      semi: ['error', 'never'],
      'no-multiple-empty-lines': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'node/no-missing-import': 'off',
      'node/no-unsupported-features/es-syntax': 'off',
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'no-process-exit': 'off',
      'no-console': 'warn',
    }
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: path.resolve(__dirname, 'tsconfig.eslint.json')
        },
        node: {
          extensions: ['.js', '.ts']
        }
      }
    }
  }
]
