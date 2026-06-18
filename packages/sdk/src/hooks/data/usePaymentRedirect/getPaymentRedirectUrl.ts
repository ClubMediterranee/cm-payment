import {
  getV2ProposalsProposalId,
  postV0PaymentsPaymentIdRedirectRequest,
  postV1Payments,
  postV3Bookings,
} from '../../../__generated__';
import { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConfigurationDisplayType as PaymentProviderDisplayType } from '../../../__generated__/bff/index.schemas';
import { GLOBAL_CAPS_SETTINGS } from '../../../config';
import { CapsFormSchema } from '../../../schemas/capsFormSchema';
import { CapsSettings } from '../../../types/CapsSettings';
import { getRedirectPaymentCallbackUrls } from '../../../utils/url/getRedirectPaymentCallbackUrls';

const mapBillingDetails = (formData: CapsFormSchema) => {
  const { billing_details, template_id } = formData;

  const number = billing_details.address?.number;
  const street = billing_details.address?.street;
  const address1 = [number, street].filter(Boolean).join(' ') || undefined;

  const mappedDetails = {
    email: billing_details.email,
    mobile_phone: billing_details.mobile_phone,
    first_name: billing_details.attendee?.first_name,
    last_name: billing_details.attendee?.last_name,
    address1,
    locality: billing_details.address?.city,
    postal_code: billing_details.address?.zip_code,
    administrative_area: billing_details.address?.state_or_district,
    country_code: billing_details.address?.country_code,
  };

  if (template_id === GLOBAL_CAPS_SETTINGS.templateIds.email) {
    return { ...mappedDetails, mobile_phone: undefined };
  }
  if (template_id === GLOBAL_CAPS_SETTINGS.templateIds.mobilePhone) {
    return { ...mappedDetails, email: undefined };
  }
  return mappedDetails;
};

export const getPaymentRedirectUrl = async (
  formData: CapsFormSchema,
  { type, id, customerId }: Pick<CapsSettings, 'type' | 'id' | 'customerId'>,
  displayType?: PaymentProviderDisplayType,
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

  const callbacks = getRedirectPaymentCallbackUrls(paymentId, formData.provider_id, displayType);

  const redirectParams = await postV0PaymentsPaymentIdRedirectRequest(paymentId, {
    ...callbacks,
    payment_condition_id: formData.payment_condition_id,
    template_id: formData.template_id,
    billing_details: mapBillingDetails(formData),
    token: formData.token?.value,
  });

  if (!redirectParams.url) {
    throw new Error('Payment redirect URL not found');
  }

  return {
    redirect: redirectParams,
    payment: { paymentId, callbacks },
  };
};
