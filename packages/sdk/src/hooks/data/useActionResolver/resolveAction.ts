import { getPaymentConfig } from '@clubmed/payment-sdk/providers/PaymentConfigProvider';

import { getV3CustomersCustomerIdBookingsBookingId } from '../../../__generated__';
import { Action, BookingStatus } from '../../../__generated__/index.schemas';
import {
  checkFreeDepositAuthorization,
  CheckFreeDepositAuthorizationArgs,
} from './checkFreeDepositAuthorization';

export const resolveAction = async ({
  action,
  freeDepositConfig,
}: {
  action?: Action;
  freeDepositConfig: CheckFreeDepositAuthorizationArgs['freeDepositConfig'];
}): Promise<Action> => {
  const { type, id, customerId } = getPaymentConfig();

  if (type === 'proposal') {
    return Action.PAYMENT_RESA;
  }

  try {
    const booking = await getV3CustomersCustomerIdBookingsBookingId(customerId!, id);
    const { booking_status: bookingStatus } = booking;

    const isOption =
      bookingStatus === BookingStatus.OPTION || bookingStatus === BookingStatus.EXPIRED;

    if (isOption) {
      return Action.PAYMENT_OPTION;
    }

    if (action === Action.PAYMENT_PARTIAL) {
      const isAllowToFreeDeposit = await checkFreeDepositAuthorization({
        freeDepositConfig,
        resortArrivalDate: booking?.stays?.[0].resort_arrival_date || undefined,
      });
      return isAllowToFreeDeposit ? Action.PAYMENT_PARTIAL : Action.PAYMENT_SOLDE;
    }

    return action && Object.values(Action).includes(action) ? action : Action.PAYMENT_SOLDE;
  } catch (error) {
    console.error('Failed to resolve booking action:', error);
    throw error;
  }
};
