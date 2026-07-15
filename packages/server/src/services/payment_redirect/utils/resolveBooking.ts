import {
  getV2ProposalsProposalId,
  postV3Bookings,
} from '../../../infra/api/__generated__/index.js';

type ResolveBookingParams = {
  type: 'proposal' | 'booking';
  id: string;
  customerId?: string;
};

export const resolveBooking = async ({ type, id, customerId }: ResolveBookingParams) => {
  if (type === 'proposal') {
    const proposal = await getV2ProposalsProposalId(id);
    const customerIdFromProposal = proposal?.households?.[0]?.attendees?.[0]?.customer_id || '';
    const booking = await postV3Bookings({ proposal_id: id } as never);

    return { bookingId: booking.booking_id, customerId: customerIdFromProposal };
  }

  return { bookingId: id, customerId };
};
