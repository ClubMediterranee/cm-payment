import {
  CategoryPaymentMethod,
  CybersourceTokenRequestParams,
  TokenRequestModelSchema,
  UnsupportedAction,
} from './constants.js';

export const ENDPOINTS = [
  'POST /v1/payments/{payment_id}/notify',
  'GET /v1/payment_providers',
  'GET /v0/customers/{customer_id}/bookings/{booking_id}/cart/accommodations',
  'GET /v3/customers/{customer_id}/bookings/{booking_id}',
  'GET /v2/customers/{customer_id}/profile',
  'GET /v0/payments/{payment_id}/status',
  'GET /v2/proposals/{proposal_id}',
  'POST /v3/bookings',
  'POST /v1/payments',
  'POST /v0/payments/{payment_id}/redirect_request',
  'POST /v0/payment_providers/{provider_id}/request_token',
  'GET /v3/schemas/{resource}/{localeOrCountry}',
  'GET /v0/countries',
  'GET /v5/proposals/{proposal_id}/transport_details',
  'GET /v4/customers/{customer_id}/bookings/{booking_id}/transport_details',
];

export default function (schema) {
  const paths = {};

  Object.entries(schema.paths).forEach(([path, value]) => {
    Object.entries(value).forEach(([method, operation]) => {
      if (!ENDPOINTS.includes(`${method.toUpperCase()} ${path}`)) {
        return;
      }

      const apiPath = '/api' + path;

      paths[apiPath] = paths[apiPath] || {};
      paths[apiPath][method] = operation;

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
        CybersourceTokenRequestParams,
        TokenRequestModel: TokenRequestModelSchema,
      },
    },
    paths,
  };
}
