import { join } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@clubmed/caps': join(root, '../sdk/src/index.ts'),
    },
  },
  test: {
    name: '@clubmed/caps-mfe',
    globals: true,
    environment: 'jsdom',
    css: false,
  },
});
