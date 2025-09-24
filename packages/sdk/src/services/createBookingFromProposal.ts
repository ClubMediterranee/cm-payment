import {getV2ProposalsProposalId, postV3Bookings} from "@clubmed/payment-sdk/__generated__/index.js";

export async function createBookingFromProposal(proposalId: string) {
  const proposal = await getV2ProposalsProposalId(proposalId);

  const customerId = proposal?.households?.[0]?.attendees?.[0].customer_id || "";

  const booking = await postV3Bookings({
    proposal_id: proposalId,
  } as never);

  return {customerId, bookingId: booking.booking_id};
}