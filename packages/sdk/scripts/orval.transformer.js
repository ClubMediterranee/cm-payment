import { createTransformer } from '../../../scripts/orval/createTransformer.js';
import {
  CategoryPaymentMethod,
  CybersourceTokenRequestParams,
  TokenRequestModelSchema,
  UnsupportedAction,
} from './constants.js';

const ENDPOINTS = [
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

export default createTransformer({
  endpoints: ENDPOINTS,
  pathPrefix: '/api',
  extraSchemas: ['CybersourceTokenRequestParams', 'TokenRequestModel'],
  overrideSchemas: (schemas) => ({
    ...schemas,
    action: {
      ...schemas.action,
      enum: schemas.action.enum.filter((action) => !UnsupportedAction.includes(action)),
    },
    PaymentProvider1: {
      ...schemas.PaymentProvider1,
      properties: {
        ...schemas.PaymentProvider1.properties,
        category_payment_method: {
          ...schemas.PaymentProvider1.properties.category_payment_method,
          enum: CategoryPaymentMethod,
        },
      },
    },
    ClientSchemaModel: {
      ...schemas.ClientSchemaModel,
      properties: {
        ...schemas.ClientSchemaModel.properties,
        properties: { type: 'object', additionalProperties: true },
        definitions: { type: 'object', additionalProperties: true },
      },
    },
    CybersourceTokenRequestParams,
    TokenRequestModel: TokenRequestModelSchema,
  }),
});
