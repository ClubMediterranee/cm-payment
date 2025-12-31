import { getPaymentConfig } from '@clubmed/payment-sdk/providers/PaymentConfigProvider';

import {
  getV0CustomersCustomerIdBookingsBookingIdCartAccommodations,
  getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule,
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from '../../../__generated__';
import { Action } from '../../../__generated__/index.schemas';
import { getResolvedAction } from '../useActionResolver';

export const getPaymentSchedule = () => {
  const { type, id, customerId } = getPaymentConfig();

  if (type === 'proposal') {
    return getV1ProposalsProposalIdPaymentSchedule(id);
  }

  if (!id) {
    throw new Error('id is required for this action');
  }

  switch (getResolvedAction()) {
    case Action.PAYMENT_OPTION:
    case Action.PAYMENT_SOLDE:
    case Action.PAYMENT_PARTIAL:
      return getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules(customerId!, id);

    case Action.PAYMENT_CART:
      return getV0CustomersCustomerIdBookingsBookingIdCartPaymentSchedule(customerId!, id);

    case Action.PAYMENT_UPGRADE_ROOM:
      return getV0CustomersCustomerIdBookingsBookingIdCartAccommodations(customerId!, id);

    default:
      throw new Error('Invalid action');
  }
};
