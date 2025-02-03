export default {
  api: {
    input: {
      target: `${import.meta.env.VITE_API_ENDPOINT}/doc/v3/swagger.json`,
      override: {
        transformer: "./orval.transformer.js",
      },
    },
    output: {
      target: "./src/api/index.ts",
      client: "fetch",
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
