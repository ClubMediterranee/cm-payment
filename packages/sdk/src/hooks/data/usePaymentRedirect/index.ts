import { noop, useMutation, useMutationState } from '@tanstack/react-query';

import { paymentRedirectControllerCreate } from '../../../__generated__/bff';
import type { CapsFormSchema } from '../../../schemas/capsFormSchema';
import type { CapsSettings } from '../../../types/CapsSettings';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';

const paymentRedirectMutationKey = (type: string, id: string) => ['paymentRedirect', type, id];

export const buildPaymentRedirectPayload = (
  formData: CapsFormSchema,
  {
    type,
    id,
    customerId,
    callbackUrl,
    callbackUrlSeller,
  }: Pick<CapsSettings, 'type' | 'id' | 'customerId' | 'callbackUrl' | 'callbackUrlSeller'>,
  watchedPaymentProvider?: ReturnType<typeof useWatchedPaymentProvider>,
) => {
  const {
    provider_id,
    action,
    amount,
    currency,
    payment_condition_id,
    template_id,
    donation_amount,
    uuid,
    reference,
    token,
    billing_details: { email, mobile_phone, attendee, address },
  } = formData;

  return {
    type,
    id,
    customer_id: customerId,
    provider_id,
    connection_type: watchedPaymentProvider?.connection_type,
    action,
    amount,
    currency,
    payment_condition_id,
    template_id,
    donation_amount,
    uuid,
    reference,
    token: token?.value,
    billing_details: {
      email,
      mobile_phone,
      first_name: attendee?.first_name,
      last_name: attendee?.last_name,
      address1: [address?.number, address?.street].filter(Boolean).join(' ') || undefined,
      locality: address?.city,
      postal_code: address?.zip_code,
      administrative_area: address?.state_or_district,
      country_code: address?.country_code,
    },
    callback_url: callbackUrl,
    callback_url_seller: callbackUrlSeller,
  };
};

type PaymentRedirectResult = Awaited<ReturnType<typeof paymentRedirectControllerCreate>>;

type Props = {
  onError?: (error: Error) => void;
  onSuccess?: (params: PaymentRedirectResult) => void;
  onLoadEnd?: () => void;
};

export const usePaymentRedirect = ({
  onError = noop,
  onSuccess = noop,
  onLoadEnd = noop,
}: Props = {}) => {
  const settings = useCapsConfigContext();
  const watchedPaymentProvider = useWatchedPaymentProvider();

  return useMutation({
    mutationKey: paymentRedirectMutationKey(settings.type, settings.id),
    mutationFn: (formData: CapsFormSchema) =>
      paymentRedirectControllerCreate(
        buildPaymentRedirectPayload(formData, settings, watchedPaymentProvider),
      ),
    onSuccess,
    onError,
    onSettled: onLoadEnd,
  });
};

type MutationFilters = NonNullable<Parameters<typeof useMutationState>[0]>['filters'];
type Predicate = NonNullable<MutationFilters>['predicate'];

export const usePaymentRedirectState = ({ predicate }: { predicate?: Predicate } = {}) => {
  const { type, id } = useCapsConfigContext();

  const data = useMutationState({
    filters: { mutationKey: paymentRedirectMutationKey(type, id), status: 'success', predicate },
    select: (mutation) => mutation.state.data as PaymentRedirectResult,
  });

  return data[data.length - 1];
};
