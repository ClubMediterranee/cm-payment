import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

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
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tools/vitest/setup.ts',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.{tsx,ts}'],
      exclude: [
        '**/packages/starter/**',
        '**/packages/docs/**',
        '**/lib/atoms/icons',
        '**/*.spec.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/*.d.ts',
        '**/types.ts',
        '**/types/**',
        '**/models.ts',
        '**/__mocks__/**',
        '**/*.msw.{ts,tsx}',
        '**/__fixtures__/**',
        '**/tests/**',
        '**/__generated__/**',
        'lib/atoms/Icons/**',
        'lib/tailwind/**',
        'lib/types/**',
        '**/index.ts',
        // deprecated
        'lib/molecules/Tabs/TabsHeader.tsx',
        'lib/molecules/Arrows.tsx',
        'lib/molecules/Card.tsx',
        'lib/molecules/Tabs/TabsHeading.tsx',
        'lib/molecules/Tabs/TabsPanel.tsx',
        'lib/contexts/Device.tsx',
      ],
      thresholds: {
        autoUpdate: true,
        statements: 88.43,
        branches: 79.14,
        functions: 85.32,
        lines: 88.3,
      },
    },
    projects: [
      'packages/*/vitest.config.ts',
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          testTimeout: 30000,
          retry: 2,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
