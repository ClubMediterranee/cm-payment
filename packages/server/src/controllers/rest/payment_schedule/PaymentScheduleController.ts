import { Controller, Inject } from '@tsed/di';
import { BodyParams, QueryParams } from '@tsed/platform-params';
import { Get } from '@tsed/schema';

import { PaymentSchedulesService } from '../../../services/PaymentSchedulesService.js';

@Controller('/payment_schedules')
export class PaymentScheduleController {
  @Inject()
  protected paymentSchedulesService!: PaymentSchedulesService;

  @Get('/')
  async paymentSchedules(
    @QueryParams() queryParams: Record<string, any>,
    @BodyParams() bodyParams: Record<string, any>,
  ) {
    const params = { ...queryParams, ...bodyParams };

    const schedules = await this.paymentSchedulesService.handlePaymentSchedules(params);

    return schedules;
  }
}
