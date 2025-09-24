import {defineConfig, type PluginOption} from "vite";
import react from "@vitejs/plugin-react-swc";
import {dirname, extname, join, relative, resolve} from "node:path";
import {fileURLToPath} from 'node:url';
import {visualizer} from "rollup-plugin-visualizer";
import {viteStaticCopy} from "vite-plugin-static-copy";
import dts from 'vite-plugin-dts';
import preserveDirectives from 'rollup-preserve-directives';
import {globbySync} from "globby";
import tsconfigPaths from "vite-tsconfig-paths";

const root = import.meta.dirname

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      projects: [join(root, '../../tsconfig.app.json')],
    }),
    dts({
      aliasesExclude: [/@clubmed\/payment-sdk.*/],
      include: ['src'],
      exclude: ['**/*.spec.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/__mocks__/**'],
    }),
    viteStaticCopy({
      targets: [
        // {src: './styles', dest: './'}, // ENABLE IT if you want to distribute css files
        {src: './package.json', dest: '.'},
        {src: '.npmignore', dest: '.'},
        {src: 'README.md', dest: '.'},
        // { src: 'CHANGELOG.md', dest: '.' },
      ],
    }),
    visualizer({open: false, filename: "dist/stats.html"}),
  ] as PluginOption[],
  resolve: {
    alias: {
      '@clubmed/trident-icons': dirname(
        fileURLToPath(import.meta.resolve('@clubmed/trident-icons')),
      ),
      '@clubmed/trident-ui': dirname(
        fileURLToPath(import.meta.resolve('@clubmed/trident-ui')),
      ),
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
        /@clubmed\/trident-icons.*/,
        /@clubmed\/trident-ui.*/,
      ],
      plugins: [preserveDirectives() as never],
      input: Object.fromEntries(
        globbySync('src/**/*.{ts,tsx}', {
          ignore: ['**/*.spec.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/__mocks__/**'],
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
    }
  }
});
