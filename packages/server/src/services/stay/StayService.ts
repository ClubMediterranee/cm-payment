import { Service } from '@tsed/di';

import {
  getV2ProposalsProposalId,
  getV3CustomersCustomerIdBookingsBookingId,
} from '../../infra/api/__generated__/index.js';
import { ResourceRef } from '../../utils/types.js';

@Service()
export class StayService {
  async getStay({ type, id, customerId }: Pick<ResourceRef, 'type' | 'id' | 'customerId'>) {
    if (type === 'booking') {
      if (!customerId) return null;
      const data = await getV3CustomersCustomerIdBookingsBookingId(customerId, id);
      return { resortArrivalDate: data?.stays?.[0]?.resort_arrival_date };
    }

    const data = await getV2ProposalsProposalId(id);
    return { resortArrivalDate: data?.resort_arrival_date };
  }
}
