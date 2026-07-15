import { Inject, Service } from '@tsed/di';

import {
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1CustomersCustomerIdBookingsBookingIdCart,
  getV1ProposalsProposalIdPaymentSchedule,
} from '../../infra/api/__generated__/index.js';
import { Action } from '../../infra/api/__generated__/index.js';
import {
  PaymentScheduleNotFoundError,
  PaymentScheduleValidationError,
  UnsupportedActionError,
} from './errors.js';
import { PaymentScheduleBuilder } from './PaymentScheduleBuilder.js';
import { PaymentScheduleNormalizer } from './PaymentScheduleNormalizer.js';
import { PaymentScheduleOutput, PaymentScheduleParams } from './types.js';

@Service()
export class PaymentSchedulesService {
  @Inject()
  private normalizer!: PaymentScheduleNormalizer;

  @Inject()
  private builder!: PaymentScheduleBuilder;

  private actionMap = {
    [Action.PAYMENT_OPTION]: getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
    [Action.PAYMENT_SOLDE]: getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
    [Action.PAYMENT_PARTIAL]: getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
    [Action.PAYMENT_CART]: getV1CustomersCustomerIdBookingsBookingIdCart,
    [Action.PAYMENT_UPGRADE_ROOM]: getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
  };

  async handlePaymentSchedules({
    type,
    id,
    customer_id,
    action,
  }: PaymentScheduleParams): Promise<PaymentScheduleOutput[]> {
    this.validateParams({ type, id, customer_id, action });

    const response =
      type === 'proposal'
        ? await getV1ProposalsProposalIdPaymentSchedule(String(id))
        : await this.actionMap[action as keyof typeof this.actionMap](
            String(customer_id),
            String(id),
          );

    const normalizedData = this.normalizer.normalize(response);

    const paymentSchedules = this.builder.build(normalizedData);

    if (!paymentSchedules.length) {
      throw new PaymentScheduleNotFoundError(id);
    }

    return paymentSchedules;
  }

  private validateParams({ type, id, customer_id, action }: PaymentScheduleParams): void {
    if (!id) {
      throw new PaymentScheduleValidationError('id is required');
    }

    if (type === 'booking' && !customer_id) {
      throw new PaymentScheduleValidationError('customer id is required');
    }

    if (type === 'booking' && !this.actionMap[action as keyof typeof this.actionMap]) {
      throw new UnsupportedActionError(action);
    }
  }
}
