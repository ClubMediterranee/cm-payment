import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

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
      all: true,
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
    }
  },
  resolve: {
    alias: {
      '@clubmed/payment-sdk': 'src',
    }
  }
});
