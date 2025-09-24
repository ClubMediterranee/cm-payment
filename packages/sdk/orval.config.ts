import type {Options} from "orval";

export default {
  api: {
    input: {
      // TO fix: check this issue and replace the target by import.meta.env.VITE_API_ENDPOINT
      target: `https://api.clubmed.com/doc/swagger.json`,
      override: {
        transformer: "./scripts/orval.transformer.js",
      },
    },
    output: {
      target: "./src/__generated__/index.ts",
      mode: "single",
      prettier: true,
      override: {
        mutator: {
          path: "./src/utils/fetcher.ts",
          name: "fetcher",
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
    },
  }
} satisfies {api: Options};
