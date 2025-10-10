import { SDKOptions } from '@clubmed/payment-sdk/types/SDKOptions';
import { getRedirectPaymentCallbackUrl } from '@clubmed/payment-sdk/utils/url/getRedirectPaymentCallbackUrl';

import {
  getV2ProposalsProposalId,
  postV0PaymentsPaymentIdRedirectRequest,
  postV1Payments,
  postV3Bookings,
} from '../../../__generated__';
import type { SDKFormData } from '../../../types/FormData';

export const getPaymentRedirectUrl = async (
  formData: SDKFormData,
  {
    withAuth,
    proposalId,
    bookingId,
    action,
    customerId,
  }: Pick<SDKOptions, 'action' | 'proposalId' | 'bookingId' | 'customerId'> & { withAuth: boolean },
) => {
  let customer_id = customerId;
  let booking_id = bookingId;

  if (!bookingId) {
    if (!proposalId) {
      throw new Error('You must provide a proposalId or a bookingId');
    }

    const proposal = await getV2ProposalsProposalId(proposalId);
    const customerIdFromProposal = proposal?.households?.[0]?.attendees?.[0]?.customer_id || '';
    const booking = await postV3Bookings({ proposal_id: proposalId } as never);

    customer_id = customerIdFromProposal;
    booking_id = booking.booking_id;
  }

  const { id: paymentId } = await postV1Payments(
    {
      booking_id: booking_id!,
      customer_id,
      currency: 'EUR',
      action,
      amount: formData.amount,
      provider_id: formData.provider_id,
    },
    { withAuth },
  );

  const callbackUrl = getRedirectPaymentCallbackUrl(paymentId, formData.provider_id);

  const { url, body } = await postV0PaymentsPaymentIdRedirectRequest(
    paymentId,
    {
      callback_url: callbackUrl || '',
      template_id: formData.template_id,
      billing_details: formData.billing_details,
    },
    { withAuth },
  );

  if (!url) {
    throw new Error('Payment redirect URL not found');
  }

  return `${url}?${body}`;
};
