import {
  Action,
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
  getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule,
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from '../../../__generated__';
import { getSDKPaymentOptions } from '../../../providers/SDKConfigProvider.js';

const isBookingAction = (
  action: Action,
): action is
  | typeof Action.PAYMENT_OPTION
  | typeof Action.PAYMENT_SOLDE
  | typeof Action.PAYMENT_PARTIAL => {
  return [Action.PAYMENT_OPTION, Action.PAYMENT_SOLDE, Action.PAYMENT_PARTIAL].includes(
    action as any,
  );
};

export const getPaymentSchedule = () => {
  const { bookingId, proposalId, customerId, action } = getSDKPaymentOptions();

  if (action === Action.PAYMENT_RESA) {
    if (!proposalId) {
      throw new Error('proposalId is required for PAYMENT_RESA action');
    }
    return getV1ProposalsProposalIdPaymentSchedule(proposalId);
  }

  if (!bookingId) {
    throw new Error('bookingId is required for this action');
  }

  if (isBookingAction(action)) {
    return getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules(customerId, bookingId, {
      withAuth: true,
    });
  }

  if (action === Action.PAYMENT_CART) {
    return getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule(customerId, bookingId, {
      withAuth: true,
    });
  }

  if (action === Action.PAYMENT_UPGRADE_ROOM) {
    return getV0CustomersCustomerIdBookingsBookingIdCartAccommodations(customerId, bookingId, {
      withAuth: true,
    });
  }

  throw new Error('Invalid action');
};
