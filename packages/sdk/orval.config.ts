export default {
  api: {
    input: {
      // TO fix: check this issue and replace the target by import.meta.env.VITE_API_ENDPOINT
      target: `${"https://api.integ.clubmed.com"}/doc/v3/swagger.json`,
      override: {
        transformer: "./orval.transformer.js",
      },
    },
    output: {
      target: "./src/gen/index.ts",
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
  },
};
