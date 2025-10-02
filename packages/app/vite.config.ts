import { join } from 'node:path';

import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv-flow';
import { defineConfig, type PluginOption } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const root = import.meta.dirname;

dotenv.config({
  path: join(root, './config'),
});

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tsconfigPaths({
      projects: [join(root, '../../tsconfig.app.json')],
    }),
    process.env.NODE_ENV !== 'test' ? (basicSsl as any)() : undefined,
  ] as PluginOption[],
  server: {
    host: process.env.HOST,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET,
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
