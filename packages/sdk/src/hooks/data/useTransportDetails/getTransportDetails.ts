import {
  getV4CustomersCustomerIdBookingsBookingIdTransportDetails,
  getV5ProposalsProposalIdTransportDetails,
} from '../../../__generated__';
import {
  BookingTransportDetailsListModelV2,
  ProposalTransportDetailsListModelV5,
} from '../../../__generated__/index.schemas';
import { CapsSettings } from '../../../types/CapsSettings';

export type TransportDetailsResponse =
  | ProposalTransportDetailsListModelV5
  | BookingTransportDetailsListModelV2;

export const getTransportDetails = async ({
  type,
  id,
  customerId,
}: Pick<CapsSettings, 'type' | 'id' | 'customerId'>): Promise<TransportDetailsResponse> => {
  if (type === 'proposal') {
    return getV5ProposalsProposalIdTransportDetails(id);
  }

  if (!customerId) {
    throw new Error('customerId is required for booking type');
  }

  return getV4CustomersCustomerIdBookingsBookingIdTransportDetails(customerId, id);
};
