import { Controller, Inject } from '@tsed/di';
import { BadRequest, InternalServerError } from '@tsed/exceptions';
import { Get, Returns, Summary } from '@tsed/schema';

import { IssuerType } from '../../../decorators/IssuerType.js';
import { Locale } from '../../../decorators/Locale.js';
import { PaymentConfig } from '../../../services/payment_config/models.js';
import { PaymentConfigService } from '../../../services/payment_config/PaymentConfigService.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';

@Controller('/payment_config')
export class PaymentConfigController {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  @Get('/')
  @Summary('Get payment configuration for a given locale and issuer type')
  @Returns(200, PaymentConfig)
  async getPaymentConfig(
    @Locale() locale: string,
    @IssuerType() issuerType: OidcIssuerTypes,
  ): Promise<PaymentConfig> {
    try {
      return await this.paymentConfigService.getPaymentConfig({ locale, issuerType });
    } catch (error) {
      if (error instanceof BadRequest || error instanceof InternalServerError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new InternalServerError(`Failed to fetch payment configuration: ${errorMessage}`);
    }
  }
}
