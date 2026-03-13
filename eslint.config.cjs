const nx = require('@nx/eslint-plugin')
const { fixupConfigRules } = require('@eslint/compat')
const js = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin')
const eslintPluginUnusedImports = require('eslint-plugin-unused-imports')
const nxEslintPlugin = require('@nx/eslint-plugin')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

module.exports = [
  ...fixupConfigRules(compat.extends('next')),
  ...fixupConfigRules(compat.extends('next/core-web-vitals')),
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/react-typescript'],
  {
    ignores: ['**/dist', '**/build', '**/node_modules', '**/.next']
  },
  {
    plugins: {
      '@nx': nxEslintPlugin,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      'unused-imports': eslintPluginUnusedImports
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*']
            }
          ]
        }
      ],
      'react-hooks/exhaustive-deps': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      '@next/next/no-img-element': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'jsx-a11y/mouse-events-have-key-events': 'warn',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      "@typescript-eslint/no-empty-object-type":'off',
      '@typescript-eslint/no-empty-function':'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
    }
  }
]
