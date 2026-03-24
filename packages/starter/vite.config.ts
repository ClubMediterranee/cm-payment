import { join } from 'node:path';

import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv-flow';
import { type PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';

const root = import.meta.dirname;

dotenv.config({
  path: join(root, './config'),
});

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    process.env.NODE_ENV !== 'test' ? (basicSsl as any)() : undefined,
  ] as PluginOption[],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: process.env.HOST,
  },
});
