import { join } from 'node:path';

import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';

const root = import.meta.dirname;

// https://module-federation.io/guide/basic/vite
export default defineConfig({
  // Relative base: chunks are resolved from the remote entry URL (the CAPS server), never from the host.
  base: '',
  plugins: [
    react(),
    federation({
      name: 'caps',
      filename: 'remoteEntry.js',
      manifest: true,
      dts: false,
      exposes: {
        './CapsForm': './src/bridge.tsx',
      },
      // Nothing is shared: React, the SDK, trident-ui… are bundled and rendered through
      // @module-federation/bridge-react in the remote's own React root.
      shared: {},
    }),
  ] as PluginOption[],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@clubmed/caps': join(root, '../sdk/src/index.ts'),
    },
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    modulePreload: false,
    assetsInlineLimit: 0,
  },
  preview: {
    cors: true,
  },
});
