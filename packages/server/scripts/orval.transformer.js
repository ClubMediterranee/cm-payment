import { CategoryPaymentMethod, UnsupportedAction } from './constants.js';

export const ENDPOINTS = [
  'POST /v1/payments/{payment_id}/notify',
  'GET /v1/payment_providers',
  'GET /v0/customers/{customer_id}/bookings/{booking_id}/payment_schedules',
  'GET /v0/customers/{customer_id}/bookings/{booking_id}/cart/payment_schedule',
  'GET /v0/customers/{customer_id}/bookings/{booking_id}/cart/accommodations',
  'GET /v1/proposals/{proposal_id}/payment_schedule',
  'GET /v3/customers/{customer_id}/bookings/{booking_id}',
  'GET /v2/customers/{customer_id}/profile',
  'GET /v0/payments/{payment_id}/status',
  'GET /v2/proposals/{proposal_id}',
  'GET /v0/countries',
  'POST /v3/bookings',
  'POST /v1/payments',
  'POST /v0/payments/{payment_id}/redirect_request',
];

export default function (schema) {
  const paths = {};

  Object.entries(schema.paths).forEach(([path, value]) => {
    Object.entries(value).forEach(([method, operation]) => {
      if (!ENDPOINTS.includes(`${method.toUpperCase()} ${path}`)) {
        return;
      }

      paths[path] = paths[path] || {};
      paths[path][method] = operation;

      if (operation.parameters) {
        operation.parameters = operation.parameters.filter((param) => param.name !== 'api_key');
      }
    });
  });

  return {
    ...schema,
    components: {
      ...schema.components,
      schemas: {
        ...schema.components.schemas,
        action: {
          ...schema.components.schemas.action,
          enum: schema.components.schemas.action.enum.filter(
            (action) => !UnsupportedAction.includes(action),
          ),
        },
        PaymentProvider1: {
          ...schema.components.schemas.PaymentProvider1,
          properties: {
            ...schema.components.schemas.PaymentProvider1.properties,
            category_payment_method: {
              ...schema.components.schemas.PaymentProvider1.properties.category_payment_method,
              enum: CategoryPaymentMethod,
            },
          },
        },
      },
    },
    paths,
  };
}
