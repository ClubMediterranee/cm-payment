import { getCapsConfig } from '@clubmed/payment-sdk/providers/CapsConfigProvider';

import {
  Action,
  BookingStatus,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../../../__generated__';
import { hasFlip } from '../../../utils/featureFlips';

export const resolveAction = async (action?: Action): Promise<Action> => {
  const { type, id, customerId } = getCapsConfig();

  if (type === 'proposal') {
    return Action.PAYMENT_RESA;
  }

  try {
    const { booking_status: bookingStatus } = await getV3CustomersCustomerIdBookingsBookingId(
      customerId!,
      id,
    );

    const isOption =
      bookingStatus === BookingStatus.OPTION || bookingStatus === BookingStatus.EXPIRED;

    if (isOption) {
      return Action.PAYMENT_OPTION;
    }

    if (action === Action.PAYMENT_PARTIAL) {
      const isEnabled = hasFlip('booking.banking.enableFreeDeposit');
      // TO DO EMERGENCY: Get free deposit deadline from api config who is actually in legacy cms
      return isEnabled ? Action.PAYMENT_PARTIAL : Action.PAYMENT_SOLDE;
    }

    return action && Object.values(Action).includes(action) ? action : Action.PAYMENT_SOLDE;
  } catch (error) {
    console.error('Failed to resolve booking action:', error);
    throw error;
  }
};
