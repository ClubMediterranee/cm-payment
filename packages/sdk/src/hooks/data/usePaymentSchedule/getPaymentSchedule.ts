import {
  getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules,
  getV1ProposalsProposalIdPaymentSchedule,
} from '@clubmed/payment-sdk/__generated__';
import { SDKOptions } from '@clubmed/payment-sdk/types/SDKOptions';

export const getPaymentSchedule = ({
  bookingId,
  proposalId,
  customerId,
}: Pick<SDKOptions, 'bookingId' | 'proposalId' | 'customerId'>) => {
  if (bookingId) {
    return getV0CustomersCustomerIdBookingsBookingIdPaymentSchedules(customerId, bookingId, {
      withAuth: true,
    });
  }

  if (!proposalId) {
    throw new Error('Either bookingId or proposalId must be provided');
  }

  return getV1ProposalsProposalIdPaymentSchedule(proposalId!);
};
