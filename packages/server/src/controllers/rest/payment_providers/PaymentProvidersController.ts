import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Enum, Get, Returns, Summary } from '@tsed/schema';

import { IssuerType } from '../../../decorators/IssuerType.js';
import { Locale } from '../../../decorators/Locale.js';
import { UserAgent } from '../../../decorators/UserAgent.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { PaymentProvidersService } from '../../../services/payment_providers/PaymentProvidersService.js';

const EnrichedPaymentProviderSchema: any = {
  allOf: [
    { $ref: 'https://api.clubmed.com/doc/swagger.json#/components/schemas/PaymentProvider1' },
    {
      type: 'object',
      properties: {
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
            requires_expiry_date: {
              type: 'boolean',
            },
          },
          required: ['display_type', 'settings'],
        },
        payment_conditions: {
          type: 'object',
          additionalProperties: true,
        },
      },
      required: ['configuration', 'payment_conditions'],
    },
  ],
};

const PaymentProvidersResponseSchema: any = {
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

@Controller('/payment_providers')
export class PaymentProvidersController {
  @Inject()
  protected paymentProvidersService!: PaymentProvidersService;

  @Get('/:type/:id')
  @Summary('Get payment providers for a booking or proposal')
  @(Returns(200).Schema(PaymentProvidersResponseSchema))
  async getPaymentProviders(
    @Enum('booking', 'proposal') @PathParams('type') type: 'booking' | 'proposal',
    @PathParams('id') id: string,
    @Locale() locale: string,
    @IssuerType() issuerType: OidcIssuerTypes,
    @UserAgent() userAgent: string | undefined,
    @QueryParams('customer_id') customerId?: string,
  ) {
    return this.paymentProvidersService.getPaymentProviders({
      type,
      id,
      locale,
      issuerType,
      customerId,
      userAgent,
    });
  }
}
