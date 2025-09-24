import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

// import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

// const dirname =
//   typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

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
        '**/packages/starter/**',
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
        statements: 5.92,
        branches: 50.58,
        functions: 25,
        lines: 5.92,
      },
    },
    projects: [
      'packages/*/vitest.config.ts',
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
});
