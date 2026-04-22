import { join } from 'node:path';

import { defineConfig } from 'orval';

const root = __dirname;

export default defineConfig({
  api: {
    input: {
      target: `https://api.clubmed.com/doc/swagger.json`,
      override: {
        transformer: join(root, 'scripts/orval.transformer.js'),
      },
    },
    output: {
      target: join(root, 'src/__generated__/index.ts'),
      mode: 'split',
      prettier: true,
      mock: true,
      override: {
        mutator: {
          path: './src/utils/fetcher.ts',
          name: 'fetcher',
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
  bff: {
    input: {
      target: 'http://localhost:8083/oas/swagger.json',
    },
    output: {
      target: join(root, 'src/__generated__/bff/index.ts'),
      mode: 'split',
      prettier: true,
      mock: true,
      override: {
        mutator: {
          path: './src/utils/fetcher.ts',
          name: 'fetcher',
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});
