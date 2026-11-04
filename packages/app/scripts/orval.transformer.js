import { createTransformer } from '../../../scripts/orval/createTransformer.js';

const ENDPOINTS = [
  'GET /v2/products/{product_id}',
  'GET /v3/customers/{customer_id}/bookings/{booking_id}',
  'GET /v2/proposals/{proposal_id}',
];

export default createTransformer({ endpoints: ENDPOINTS });
