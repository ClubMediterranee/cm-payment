export default {
  api: {
    input: {
      // TO fix: check this issue and replace the target by import.meta.env.VITE_API_ENDPOINT
      target: `${"https://api.integ.clubmed.com"}/doc/v3/swagger.json`,
      override: {
        transformer: "./scripts/orval.transformer.js",
      },
      onlyOperationIds: [
        "postV1PaymentsPaymentIdNotify",
        "getV1PaymentProviders",
        "getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules",
        "getV1ProposalsProposalIdPaymentSchedule",
        "getV0PaymentsPaymentIdStatus"
      ]
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
  },
};
