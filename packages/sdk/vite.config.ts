import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { globbySync } from 'globby';
import { visualizer } from 'rollup-plugin-visualizer';
import preserveDirectives from 'rollup-preserve-directives';
import { defineConfig, type PluginOption } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/**
 * The package is published from `dist/`: paths of the published package.json are relative to `dist/`.
 */
function toPublishedPackageJson(content: string): string {
  const pkg = JSON.parse(content);
  const strip = (value: unknown): unknown =>
    typeof value === 'string'
      ? value.replace(/^\.\/dist\//, './')
      : value && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, strip(entry)]))
        : value;

  return `${JSON.stringify({ ...pkg, main: './index.js', types: './index.d.ts', exports: strip(pkg.exports), scripts: undefined, devDependencies: undefined }, null, 2)}\n`;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      entryRoot: 'src',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.spec.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/__mocks__/**',
        '**/*.msw.{ts,tsx}',
      ],
      tsconfigPath: './tsconfig.build.json',
    }),
    viteStaticCopy({
      targets: [
        // {src: './styles', dest: './'}, // ENABLE IT if you want to distribute css files
        { src: './package.json', dest: '.', transform: toPublishedPackageJson },
        { src: '.npmignore', dest: '.' },
        { src: 'README.md', dest: '.' },
        // { src: 'CHANGELOG.md', dest: '.' },
      ],
    }),
    visualizer({ open: false, filename: 'dist/stats.html' }),
  ] as PluginOption[],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@clubmed/trident-icons': dirname(
        fileURLToPath(import.meta.resolve('@clubmed/trident-icons')),
      ),
      '@clubmed/trident-ui': dirname(fileURLToPath(import.meta.resolve('@clubmed/trident-ui'))),
    },
  },
  build: {
    assetsInlineLimit: 0,
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
    },
    copyPublicDir: false,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@react-spring/web',
        /^react-dom(\/.*)?$/,
        /^react\/.*/,
        /^@module-federation\/.*/,
        /@clubmed\/trident-icons.*/,
        /@clubmed\/trident-ui.*/,
      ],
      plugins: [preserveDirectives() as never],
      input: Object.fromEntries(
        globbySync('src/**/*.{ts,tsx}', {
          ignore: [
            '**/*.d.ts',
            '**/*.spec.{ts,tsx}',
            '**/*.stories.{ts,tsx}',
            '**/__mocks__/**',
            '**/*.msw.{ts,tsx}',
          ],
        }).map((file) => [
          // The name of the entry point
          // lib/nested/foo.ts becomes nested/foo
          relative('src', file.slice(0, file.length - extname(file).length)),
          // The absolute path to the entry file
          // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
          fileURLToPath(new URL(file, import.meta.url)),
        ]),
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'chunks/[name].js',
        entryFileNames: '[name].js',
        globals: {
          react: 'React',
        },
      },
    },
  },
});
