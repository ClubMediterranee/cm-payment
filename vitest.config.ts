import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';

// import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg?react',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tools/vitest/setup.ts',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['packages/*/src/**/*.{tsx,ts}'],
      exclude: [
        '**/lib/atoms/icons',
        '**/*.spec.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/*.d.ts',
        '**/__mocks__/**',
        '**/tests/**',
        'lib/atoms/Icons/**',
        'lib/tailwind/**',
        'lib/types/**',
        '**/index.ts',
        //deprecated
        'lib/molecules/Tabs/TabsHeader.tsx',
        'lib/molecules/Arrows.tsx',
        'lib/molecules/Card.tsx',
        'lib/molecules/Tabs/TabsHeading.tsx',
        'lib/molecules/Tabs/TabsPanel.tsx',
        'lib/contexts/Device.tsx',
      ],
      thresholds: {
        autoUpdate: true,
        statements: 0,
        branches: 2.7,
        functions: 2.7,
        lines: 0,
      },
    },
    projects: [
      "packages/*/vitest.config.ts",
      // {
      //   extends: true,
      //   plugins: [
      //     // The plugin will run tests for the stories defined in your Storybook config
      //     // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      //     storybookTest({
      //       configDir: path.join(dirname, '.storybook'),
      //     }),
      //   ],
      //   test: {
      //     name: 'storybook',
      //     browser: {
      //       enabled: true,
      //       headless: true,
      //       provider: 'playwright',
      //       instances: [
      //         {
      //           browser: 'chromium',
      //         },
      //       ],
      //     },
      //     setupFiles: ['.storybook/vitest.setup.ts'],
      //   },
      // },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './lib'),
    },
  },
});