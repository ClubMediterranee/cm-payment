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

console.log('⚙️  Vite config:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- HOST:', process.env.HOST);
console.log('- VITE_BASE_PATH:', process.env.VITE_BASE_PATH);
console.log('- VITE_GM_OIDC_URL:', process.env.VITE_GM_OIDC_URL);
console.log('- VITE_GO_OIDC_URL:', process.env.VITE_GO_OIDC_URL);
console.log('- API_TARGET:', process.env.API_TARGET);
console.log('');

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
        target: process.env.API_TARGET,
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
