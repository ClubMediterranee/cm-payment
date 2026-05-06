import { Controller, Inject } from '@tsed/di';
import { Context, PathParams, QueryParams } from '@tsed/platform-params';
import { Enum, Get, Returns, Summary } from '@tsed/schema';

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
              enum: ['hosted_field', 'iframe', 'redirect'],
            },
            settings: {
              type: 'object',
              additionalProperties: true,
            },
            validation: {
              type: 'object',
              properties: {
                requires_token: { type: 'boolean' },
                requires_expiry_date: { type: 'boolean' },
              },
              required: ['requires_token', 'requires_expiry_date'],
            },
          },
          required: ['display_type', 'settings', 'validation'],
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
    @Context() ctx: Context,
    @QueryParams('customer_id') customerId?: string,
  ): Promise<any> {
    const locale = ctx.request.headers['accept-language'] || 'fr-FR';
    const issuerType = ctx.request.headers['x-issuer-type'] as OidcIssuerTypes;

    if (type === 'booking' && !customerId) {
      throw new Error('customer_id is required for booking type');
    }

    return this.paymentProvidersService.getPaymentProviders({
      type,
      id,
      locale,
      issuerType,
      customerId,
    });
  }
}
