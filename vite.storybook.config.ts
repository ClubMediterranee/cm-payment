import { join } from 'node:path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const root = join(import.meta.dirname);

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      projects: [join(root, 'tsconfig.json')],
    }),
  ],
  build: {
    target: 'es2022',
  },
});
