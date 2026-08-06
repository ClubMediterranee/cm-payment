import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Enum, Get, Returns, Summary } from '@tsed/schema';

import { IssuerType } from '../../../decorators/IssuerType.js';
import { Locale } from '../../../decorators/Locale.js';
import { UserAgent } from '../../../decorators/UserAgent.js';
import { Action } from '../../../infra/api/__generated__/index.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { PaymentProvidersResponseSchema } from '../../../services/payment_providers/models.js';
import { PaymentProvidersService } from '../../../services/payment_providers/PaymentProvidersService.js';

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
    @Enum(Action) @QueryParams('action') action?: Action,
  ) {
    return this.paymentProvidersService.getPaymentProviders({
      type,
      id,
      locale,
      issuerType,
      customerId,
      userAgent,
      action,
    });
  }
}
