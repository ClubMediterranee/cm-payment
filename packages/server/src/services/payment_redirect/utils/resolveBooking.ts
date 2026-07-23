import {
  CreateDirectBookingRequestModel,
  getV2ProposalsProposalId,
  postV3Bookings,
} from '../../../infra/api/__generated__/index.js';

type ResolveBookingParams = {
  type: 'proposal' | 'booking';
  id: string;
  customerId?: string;
  comment?: CreateDirectBookingRequestModel['comment'];
};

export const resolveBooking = async ({ type, id, customerId, comment }: ResolveBookingParams) => {
  if (type === 'proposal') {
    const proposal = await getV2ProposalsProposalId(id);
    const customerIdFromProposal = proposal?.households?.[0]?.attendees?.[0]?.customer_id || '';
    const booking = await postV3Bookings({
      proposal_id: id,
      duration: proposal.duration!,
      resort_arrival_date: proposal.resort_arrival_date,
      product_id: proposal.product_id,
      ...(comment ? { comment } : {}),
    });

    return { bookingId: booking.booking_id, customerId: customerIdFromProposal };
  }

  return { bookingId: id, customerId };
};
