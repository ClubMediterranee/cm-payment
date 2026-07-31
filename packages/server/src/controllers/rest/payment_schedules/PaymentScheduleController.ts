import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Enum, Get, Returns, Summary } from '@tsed/schema';

import { IssuerType } from '../../../decorators/IssuerType.js';
import { Locale } from '../../../decorators/Locale.js';
import { Action } from '../../../infra/api/__generated__/index.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';
import { OverpaymentAllowanceOutputModel } from '../../../services/payment_overpayment_allowance/models.js';
import { OverpaymentAllowanceService } from '../../../services/payment_overpayment_allowance/OverpaymentAllowanceService.js';
import { PaymentScheduleOutputModel } from '../../../services/payment_schedules/models.js';
import { PaymentSchedulesService } from '../../../services/payment_schedules/PaymentSchedulesService.js';

@Controller('/payment_schedules')
export class PaymentScheduleController {
  @Inject()
  protected paymentSchedulesService!: PaymentSchedulesService;

  @Inject()
  protected overpaymentAllowanceService!: OverpaymentAllowanceService;

  @Get('/booking/:bookingId/overpayment_allowance')
  @Summary('Get the allowed surplus above the due amount for a booking')
  @Returns(200, OverpaymentAllowanceOutputModel)
  async getOverpaymentAllowance(
    @PathParams('bookingId') bookingId: string,
    @QueryParams('customer_id') customerId: string,
    @IssuerType() issuerType: OidcIssuerTypes,
    @Locale() locale: string,
  ) {
    return this.overpaymentAllowanceService.getOverpaymentAllowance({
      bookingId,
      customerId,
      issuerType,
      locale,
    });
  }

  @Get('/:type/:id')
  @Summary('Get payment schedules by type and id')
  @(Returns(200, Array).Of(PaymentScheduleOutputModel))
  async getPaymentSchedules(
    @Enum('booking', 'proposal') @PathParams('type') type: 'booking' | 'proposal',
    @PathParams('id') id: string,
    @Enum(Action) @QueryParams('action') action: Action,
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
