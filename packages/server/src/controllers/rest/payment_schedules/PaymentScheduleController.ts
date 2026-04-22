import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Get, Returns, Summary } from '@tsed/schema';

import { Action } from '../../../infra/api/__generated__/index.schemas.js';
import { PaymentScheduleOutputModel } from '../../../services/payment_schedules/models.js';
import { PaymentSchedulesService } from '../../../services/payment_schedules/PaymentSchedulesService.js';

@Controller('/payment_schedules')
export class PaymentScheduleController {
  @Inject()
  protected paymentSchedulesService!: PaymentSchedulesService;

  @Get('/:type/:id')
  @Summary('Get payment schedules by type and id')
  @(Returns(200, Array).Of(PaymentScheduleOutputModel))
  async getPaymentSchedules(
    @PathParams('type') type: 'booking' | 'proposal',
    @PathParams('id') id: string,
    @QueryParams('action') action: Action,
    @QueryParams('customer_id') customer_id?: string,
  ) {
    return await this.paymentSchedulesService.handlePaymentSchedules({
      type,
      id,
      action,
      customer_id,
    });
  }
}
