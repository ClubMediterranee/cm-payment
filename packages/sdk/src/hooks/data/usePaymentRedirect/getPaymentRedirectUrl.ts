import { GLOBAL_CAPS_SETTINGS } from '@clubmed/payment-sdk/config';
import { CapsFormSchema } from '@clubmed/payment-sdk/schemas/capsFormSchema';
import { CapsSettings } from '@clubmed/payment-sdk/types/CapsSettings';
import { getRedirectPaymentCallbackUrl } from '@clubmed/payment-sdk/utils/url/getRedirectPaymentCallbackUrl';

import {
  getV2ProposalsProposalId,
  postV0PaymentsPaymentIdRedirectRequest,
  postV1Payments,
  postV3Bookings,
} from '../../../__generated__';

const cleanBillingDetails = (
  billingDetails: CapsFormSchema['billing_details'],
  templateId: CapsFormSchema['template_id'],
) => {
  if (templateId === GLOBAL_CAPS_SETTINGS.templateIds.email) {
    return { ...billingDetails, mobile_phone: undefined };
  }
  if (templateId === GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone) {
    return { ...billingDetails, email: undefined };
  }
  return billingDetails;
};

export const getPaymentRedirectUrl = async (
  formData: CapsFormSchema,
  { type, id, customerId }: Pick<CapsSettings, 'type' | 'id' | 'customerId'>,
) => {
  let customer_id = customerId;
  let booking_id = id;

  if (type === 'proposal') {
    const proposal = await getV2ProposalsProposalId(id);
    const customerIdFromProposal = proposal?.households?.[0]?.attendees?.[0]?.customer_id || '';
    const booking = await postV3Bookings({ proposal_id: id } as never);

    customer_id = customerIdFromProposal;
    booking_id = booking.booking_id;
  }

  const { id: paymentId } = await postV1Payments({
    booking_id: booking_id!,
    customer_id: customer_id!,
    currency: formData.currency,
    action: formData.action,
    amount: Number(formData.amount),
    provider_id: formData.provider_id,
  });

  const callbackUrl = getRedirectPaymentCallbackUrl(paymentId, formData.provider_id);

  const { url, body } = await postV0PaymentsPaymentIdRedirectRequest(paymentId, {
    callback_url: callbackUrl || '',
    template_id: formData.template_id,
    billing_details: cleanBillingDetails(formData.billing_details, formData.template_id),
    token: formData.token?.value,
  });

  if (!url) {
    throw new Error('Payment redirect URL not found');
  }

  return `${url}?${body}`;
};
