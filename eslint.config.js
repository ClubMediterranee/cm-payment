import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierRecommendedPlugin from 'eslint-plugin-prettier/recommended';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import vitestPlugin from 'eslint-plugin-vitest';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/.docusaurus/**',
      '**/node_modules',
      '**/__generated__',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    ignores: ['vitest.shims.d.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      ...jsxA11yPlugin.flatConfigs.recommended.plugins,
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['packages/**/*.spec.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    plugins: {
      'testing-library': testingLibraryPlugin,
      vitest: vitestPlugin,
    },
    rules: {
      ...testingLibraryPlugin.configs.rules,
      ...vitestPlugin.configs.recommended.rules,
    },
  },
  prettierRecommendedPlugin,
);
