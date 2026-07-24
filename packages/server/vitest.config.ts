import { defineConfig } from 'vitest/config';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'node',
    // setupFiles: './tools/vitest/setup.ts',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // all: true,
      include: ['src/**/*.{tsx,ts}'],
      exclude: [
        '**/*.spec.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/*.d.ts',
        '**/__mocks__/**',
        '**/__generated__/**',
        '**/tests/**',
        '**/index.ts',
      ],
      thresholds: {
        autoUpdate: true,
        statements: 93.25,
        branches: 84.21,
        functions: 93.33,
        lines: 93.03,
      },
    },
  },
});
