export default {
  api: {
    input: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      target: `${import.meta.env.VITE_API_ENDPOINT}/doc/v3/swagger.json`,
      override: {
        transformer: "./orval.transformer.js",
      },
    },
    output: {
      target: "./src/__generated__/index.ts",
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
