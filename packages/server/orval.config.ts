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
      target: join(root, 'src/infra/api/__generated__/index.ts'),
      mode: 'single',
      prettier: true,
      override: {
        mutator: {
          path: './src/infra/http/fetcher.ts',
          name: 'fetcher',
          extension: '.js',
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
  oneyMarketing: {
    input: {
      target: 'https://docs.oney.com/content/openapi/marketing-api_v1.1.yaml',
    },
    output: {
      target: join(root, 'src/infra/oney/__generated__/index.ts'),
      mode: 'single',
      prettier: true,
      override: {
        mutator: {
          path: './src/infra/oney/fetcher.ts',
          name: 'oneyFetcher',
          extension: '.js',
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  },
});
