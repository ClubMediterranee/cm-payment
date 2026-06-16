import { Inject, Service } from '@tsed/di';

import { getV3CustomersCustomerIdBookingsBookingId } from '../../infra/api/__generated__/index.js';
import {
  Action,
  BookingStatus,
  CustomerBookingStayModelV2,
} from '../../infra/api/__generated__/index.js';
import { daysUntilToday } from '../../utils/daysUntilToday.js';
import { parseApiDate } from '../../utils/parseApiDate.js';
import { ResourceRef } from '../../utils/types.js';
import { PaymentConfigService } from '../payment_config/PaymentConfigService.js';
import { PaymentSchedulesService } from '../payment_schedules/PaymentSchedulesService.js';
import { ActionResolverValidationError } from './errors.js';

const NO_LIMIT_DAYS = 999;

@Service()
export class ActionResolverService {
  @Inject()
  protected paymentConfigService!: PaymentConfigService;

  @Inject()
  protected paymentSchedulesService!: PaymentSchedulesService;

  async resolveAction({
    type,
    id,
    customerId,
    action,
    locale,
    issuerType,
  }: Pick<ResourceRef, 'type' | 'id' | 'customerId' | 'action' | 'locale' | 'issuerType'>) {
    if (!id) {
      throw new ActionResolverValidationError('id is required');
    }

    if (type === 'proposal') {
      return Action.PAYMENT_RESA;
    }

    if (!customerId) {
      throw new ActionResolverValidationError('customer id is required');
    }

    const booking = await getV3CustomersCustomerIdBookingsBookingId(customerId, id);
    const bookingStatus = booking?.booking_status;

    if (bookingStatus === BookingStatus.OPTION || bookingStatus === BookingStatus.EXPIRED) {
      return Action.PAYMENT_OPTION;
    }

    if (action === Action.PAYMENT_PARTIAL) {
      const isAllowedFreeDeposit = await this.isAllowedFreeDeposit({
        id,
        customerId,
        resortArrivalDate: booking?.stays?.[0]?.resort_arrival_date,
        locale,
        issuerType,
      });
      return isAllowedFreeDeposit ? Action.PAYMENT_PARTIAL : Action.PAYMENT_SOLDE;
    }

    return action && Object.values(Action).includes(action) ? action : Action.PAYMENT_SOLDE;
  }

  private async isAllowedFreeDeposit({
    id,
    customerId,
    resortArrivalDate,
    locale,
    issuerType,
  }: Pick<ResourceRef, 'id' | 'locale' | 'issuerType'> & {
    customerId: string;
    resortArrivalDate?: CustomerBookingStayModelV2['resort_arrival_date'];
  }) {
    const paymentConfig = await this.paymentConfigService.getPaymentConfig({ locale, issuerType });

    const daysBeforeTrip = paymentConfig.settings.days_before_trip_to_allow_free_deposit ?? null;

    const shouldUseScheduleDeadline = daysBeforeTrip === null || daysBeforeTrip === NO_LIMIT_DAYS;

    let apiDeadline = resortArrivalDate;
    if (shouldUseScheduleDeadline) {
      const schedules = await this.paymentSchedulesService.handlePaymentSchedules({
        type: 'booking',
        id,
        customer_id: customerId,
        action: Action.PAYMENT_PARTIAL,
      });
      apiDeadline = schedules[0]?.deadline;
    }

    const deadline = parseApiDate(apiDeadline);

    if (!deadline) {
      return false;
    }

    const daysUntilDeadline = daysUntilToday(deadline);
    if (shouldUseScheduleDeadline) {
      return daysUntilDeadline > 0;
    }
    return daysUntilDeadline - (daysBeforeTrip ?? 0) > 0;
  }
}
