import { Controller, Inject } from '@tsed/di';
import { Context } from '@tsed/platform-params';
import { Get, Returns, Summary } from '@tsed/schema';

import { PaymentConfigService } from '../../../services/payment_config/PaymentConfigService.js';
import { PaymentConfig } from '../../../services/payment_config/models.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';

@Controller('/payment_config')
export class PaymentConfigController {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  @Get('/')
  @Summary('Get payment configuration for a given locale and issuer type')
  @Returns(200, PaymentConfig)
  async getPaymentConfig(@Context() ctx: Context): Promise<PaymentConfig> {
    const locale = ctx.request.headers['accept-language'] || 'fr-FR';
    const issuerType = ctx.request.headers['x-issuer-type'] as OidcIssuerTypes;

    return this.paymentConfigService.getPaymentConfig({ locale, issuerType });
  }
}
