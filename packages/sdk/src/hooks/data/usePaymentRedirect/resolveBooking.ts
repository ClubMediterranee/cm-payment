import { getV2ProposalsProposalId, postV3Bookings } from '../../../__generated__';
import { CapsSettings } from '../../../types/CapsSettings';

export const resolveBooking = async ({
  type,
  id,
  customerId,
}: Pick<CapsSettings, 'type' | 'id' | 'customerId'>) => {
  if (type === 'proposal') {
    const proposal = await getV2ProposalsProposalId(id);
    const customerIdFromProposal = proposal?.households?.[0]?.attendees?.[0]?.customer_id || '';
    const booking = await postV3Bookings({ proposal_id: id } as never);

    return { booking_id: booking.booking_id, customer_id: customerIdFromProposal };
  }

  return { booking_id: id, customer_id: customerId };
};
