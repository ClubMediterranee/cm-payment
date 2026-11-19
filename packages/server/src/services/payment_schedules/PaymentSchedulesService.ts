import { Inject, Service } from '@tsed/di';

import {
  getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
  GetV1CustomersCustomerIdBookingsBookingIdPaymentSchedulesAction as BookingPaymentScheduleAction,
} from '../../infra/api/__generated__/index.js';
import {
  PaymentScheduleNotFoundError,
  PaymentScheduleValidationError,
  UnsupportedActionError,
} from './errors.js';
import { PaymentScheduleBuilder } from './PaymentScheduleBuilder.js';
import { PaymentScheduleNormalizer } from './PaymentScheduleNormalizer.js';
import { PaymentScheduleOutput, PaymentScheduleParams } from './types.js';

const SUPPORTED_BOOKING_ACTIONS: string[] = Object.values(BookingPaymentScheduleAction);

@Service()
export class PaymentSchedulesService {
  @Inject()
  private normalizer!: PaymentScheduleNormalizer;

  @Inject()
  private builder!: PaymentScheduleBuilder;

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
        : await getV1CustomersCustomerIdBookingsBookingIdPaymentSchedules(
            String(customer_id),
            String(id),
            { action: action as BookingPaymentScheduleAction },
          );

    const normalizedData = this.normalizer.normalize(response, action);

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

    if (type === 'booking' && !SUPPORTED_BOOKING_ACTIONS.includes(action)) {
      throw new UnsupportedActionError(action);
    }
  }
}
