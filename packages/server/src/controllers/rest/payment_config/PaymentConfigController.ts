import { Controller, Inject } from '@tsed/di';
import { BodyParams, QueryParams } from '@tsed/platform-params';
import { PlatformViews } from '@tsed/platform-views';
import { Get } from '@tsed/schema';

import { PaymentConfigService } from '../../../services/PaymentConfigService.js';

@Controller('/payment_config')
export class PaymentConfigController {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  @Inject()
  protected views!: PlatformViews;

  @Get('/')
  async getConfig(
    @QueryParams() queryParams: Record<string, any>,
    @BodyParams() bodyParams: Record<string, any>,
  ) {
    const params = { ...queryParams, ...bodyParams };

    const config = await this.paymentConfigService.getPaymentConfig(params);

    return config;
  }
}
