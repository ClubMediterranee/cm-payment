import { MANUAL_CONNECTION_TYPE } from './types.js';

export const EnrichedPaymentProviderSchema: any = {
  allOf: [
    { $ref: 'https://api.clubmed.com/doc/swagger.json#/components/schemas/PaymentProvider1' },
    {
      type: 'object',
      properties: {
        connection_type: {
          type: 'string',
          enum: ['E-commerce', MANUAL_CONNECTION_TYPE],
        },
        configuration: {
          type: 'object',
          properties: {
            display_type: {
              type: 'string',
              enum: ['hosted_field', 'iframe', 'redirect', 'custom'],
            },
            settings: {
              type: 'object',
              additionalProperties: true,
            },
            requires_token: {
              type: 'boolean',
            },
            requires_card_holder: {
              type: 'boolean',
            },
            requires_expiry_date: {
              type: 'boolean',
            },
          },
          required: ['display_type', 'settings'],
        },
        payment_conditions: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              $ref: 'https://api.clubmed.com/doc/swagger.json#/components/schemas/TimePaymentConditionModel',
            },
          },
        },
      },
      required: ['connection_type', 'configuration', 'payment_conditions'],
    },
  ],
};

export const PaymentProvidersResponseSchema: any = {
  type: 'object',
  properties: {
    payment_providers: {
      type: 'array',
      items: EnrichedPaymentProviderSchema,
    },
    buy_now_pay_later_providers: {
      type: 'array',
      items: EnrichedPaymentProviderSchema,
    },
  },
  required: ['payment_providers', 'buy_now_pay_later_providers'],
};
