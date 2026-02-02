// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { esbuildCjsShimPlugin } from '@clubmed/esbuild-cjs-shim-plugin';
import eslintPluginTsc from 'esbuild-plugin-tsc';
import * as path from 'path';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: false, // !options.watch,
  platform: 'node',
  target: 'esnext',
  bundle: true,
  keepNames: true,
  shims: false,
  format: 'esm',
  noExternal: [/.*/],
  incremental: options.watch,
  mainFields: ['source', 'main'],
  esbuildPlugins: [
    eslintPluginTsc({
      tsconfigPath: path.join(process.cwd(), 'tsconfig.node.json'),
    }),
    esbuildCjsShimPlugin(),
  ],
}));
