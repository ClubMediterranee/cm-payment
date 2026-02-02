import type { PluginBuild } from 'esbuild';

export function esbuildCjsShimPlugin() {
  return {
    name: 'esbuild-pkg-plugin',
    setup(build: PluginBuild) {
      build.onStart(() => {
        const warnings = [];

        if (build.initialOptions.minifyIdentifiers) {
          warnings.push({
            text: "'minifyIdentifiers' is set to true but was forced to false.\n  It would break functions as the handler function would be renamed.",
          });
        }

        if (build.initialOptions.format && build.initialOptions.format !== 'esm') {
          warnings.push({
            text: `'format' is set to ${build.initialOptions.format} but was forced to 'esm'.\n  'esm' produces the smallest files while still working.`,
          });
        }

        return {
          warnings,
        };
      });

      build.initialOptions.format = 'esm';
      build.initialOptions.inject = ['@clubmed/esbuild-cjs-shim-plugin/cjsShim.js'];
      // If identifiers are minified `handler` will be, and will break the function
      build.initialOptions.minifyIdentifiers = false;

      if (build.initialOptions.minify) {
        build.initialOptions.minify = false;
        build.initialOptions.minifyWhitespace = true;
        build.initialOptions.minifySyntax = true;
      }
    },
  };
}
