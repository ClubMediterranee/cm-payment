import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    // setupFiles: './tools/vitest/setup.ts',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
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
        statements: 99.77,
        branches: 96.72,
        functions: 98.73,
        lines: 99.77,
      },
    },
  },
  resolve: {
    alias: {
      '@clubmed/caps': path.resolve(__dirname, '../sdk/src'),
    },
  },
});
