import { Controller, Inject } from '@tsed/di';
import { Get, Returns, Summary } from '@tsed/schema';

import { Locale } from '../../../decorators/Locale.js';
import { PaymentContent } from '../../../services/payment_config/models.js';
import { PaymentConfigService } from '../../../services/payment_config/PaymentConfigService.js';

@Controller('/payment_content')
export class PaymentContentController {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  @Get('/')
  @Summary('Get the CAPS wording for a given locale, merged over the global (*) content')
  @Returns(200, PaymentContent)
  async getPaymentContent(@Locale() locale: string) {
    return this.paymentConfigService.getContent(locale);
  }
}
