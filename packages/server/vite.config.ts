import { builtinModules } from 'node:module';

import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'custom',
  build: {
    outDir: 'dist',
    target: 'node24',
    ssr: 'src/index.ts',
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
      output: {
        entryFileNames: 'index.js',
        format: 'es',
      },
    },
  },
});
