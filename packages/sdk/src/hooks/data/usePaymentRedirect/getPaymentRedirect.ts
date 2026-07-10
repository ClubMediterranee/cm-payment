import { paymentRedirectControllerPaymentless } from '../../../__generated__/bff';
import { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConnectionType as ConnectionType } from '../../../__generated__/bff/index.schemas';
import type { CapsFormSchema } from '../../../schemas/capsFormSchema';
import type { CapsSettings } from '../../../types/CapsSettings';
import type { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';
import { resolveBooking } from './resolveBooking';

export const getPaymentRedirect = async (
  formData: CapsFormSchema,
  {
    type,
    id,
    customerId,
    callbackUrlSeller,
  }: Pick<CapsSettings, 'type' | 'id' | 'customerId' | 'callbackUrlSeller'>,
  watchedPaymentProvider?: ReturnType<typeof useWatchedPaymentProvider>,
) => {
  const { booking_id, customer_id } = await resolveBooking({ type, id, customerId });

  if (watchedPaymentProvider?.connection_type === ConnectionType.Manual) {
    const redirect = await paymentRedirectControllerPaymentless({
      callback_url: callbackUrlSeller || '',
      booking_id: booking_id!,
      customer_id: customer_id!,
      provider_id: formData.provider_id,
      amount: formData.amount,
      currency: formData.currency,
      ...(type === 'proposal' ? { proposal_id: id } : {}),
    });

    return { redirect, payment: null };
  }

  return getPaymentRedirectUrl(
    formData,
    { booking_id, customer_id },
    watchedPaymentProvider?.configuration.display_type,
  );
};
