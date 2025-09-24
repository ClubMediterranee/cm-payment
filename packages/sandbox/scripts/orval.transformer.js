
export const ENDPOINTS = [
  "GET /v2/products/{product_id}",
  "GET /v3/customers/{customer_id}/bookings/{booking_id}",
  "GET /v2/proposals/{proposal_id}"
]

export default function (schema) {
  const paths = {}

  Object.entries(schema.paths).forEach(([path, value]) => {
    Object.entries(value).forEach(([method, operation]) => {
      if (!ENDPOINTS.includes(`${method.toUpperCase()} ${path}`)) {
        return;
      }

      paths[path] = paths[path] || {};
      paths[path][method] = operation;

      if (operation.parameters) {
        operation.parameters = operation.parameters.filter(
          (param) => param.name !== "api_key"
        );
      }
    });
  });

  return {
    ...schema,
    paths
  };
}
