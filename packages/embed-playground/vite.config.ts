import { join } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Tailwind v4 runs through @tailwindcss/vite: do not inherit the root Tailwind v3 PostCSS config.
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: {
      // Use the wrapper sources, like a host would use the published sub-path exports.
      '@clubmed/caps/webcomponent': join(root, '../sdk/src/embed/webcomponent/index.ts'),
      '@clubmed/caps/iframe': join(root, '../sdk/src/embed/iframe/index.ts'),
    },
  },
});
