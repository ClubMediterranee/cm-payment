import { createTransformer } from '../../../scripts/orval/createTransformer.js';
import { CategoryPaymentMethod, UnsupportedAction } from './constants.js';

const ENDPOINTS = [
  'POST /v1/payments/{payment_id}/notify',
  'GET /v1/payment_providers',
  'GET /v0/customers/{customer_id}/bookings/{booking_id}/payment_schedules',
  'GET /v1/customers/{customer_id}/bookings/{booking_id}/cart',
  'GET /v3/customers/{customer_id}/bookings/{booking_id}/services',
  'GET /v0/customers/{customer_id}/bookings/{booking_id}/cart/accommodations',
  'GET /v1/proposals/{proposal_id}/payment_schedule',
  'GET /v3/customers/{customer_id}/bookings/{booking_id}',
  'GET /v2/customers/{customer_id}/profile',
  'GET /v0/payments/{payment_id}/status',
  'GET /v2/proposals/{proposal_id}',
  'GET /v0/countries',
  'POST /v3/bookings',
  'PATCH /v2/bookings/{booking_id}',
  'POST /v1/payments',
  'POST /v0/payments/{payment_id}/redirect_request',
  'POST /v0/payment_providers/{provider_id}/request_token',
];

export default createTransformer({
  endpoints: ENDPOINTS,
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
  }),
});
