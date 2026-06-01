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
        '**/tests/**',
        '**/index.ts',
      ],
      thresholds: {
        autoUpdate: true,
        statements: 75.05,
        branches: 64.43,
        functions: 41.63,
        lines: 77.45,
      },
    },
  },
});
