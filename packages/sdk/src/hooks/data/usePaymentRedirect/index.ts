import { noop, useMutation, useMutationState } from '@tanstack/react-query';

import { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItemAllOfConnectionType as ConnectionType } from '../../../__generated__/bff/index.schemas';
import type { ProviderParametersModel } from '../../../__generated__/index.schemas';
import type { CapsFormSchema } from '../../../schemas/capsFormSchema';
import {
  type CallbackUrls,
  getRedirectPaymentCallbackUrls,
} from '../../../utils/url/getRedirectPaymentCallbackUrls';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';
import { resolveBooking } from './resolveBooking';

export type PaymentRedirectResult = {
  redirect: ProviderParametersModel;
  payment?: { paymentId: string; callbacks: CallbackUrls };
};

const paymentRedirectMutationKey = (type: string, id: string) => ['paymentRedirect', type, id];

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
  const { type, id, customerId } = useCapsConfigContext();

  const watchedPaymentProvider = useWatchedPaymentProvider();

  const mutationFn = async (formData: CapsFormSchema): Promise<PaymentRedirectResult> => {
    const { booking_id, customer_id } = await resolveBooking({ type, id, customerId });

    if (watchedPaymentProvider?.connection_type === ConnectionType.Manual) {
      const callbacks = getRedirectPaymentCallbackUrls({
        paymentId: 'paymentless',
        providerId: formData.provider_id,
        params: {
          booking_id,
          customer_id,
          amount: formData.amount,
          currency: formData.currency,
        },
      });

      return {
        redirect: { url: callbacks.callback_url_seller ?? callbacks.callback_url, method: 'GET' },
      };
    }

    return getPaymentRedirectUrl(
      formData,
      { booking_id, customer_id },
      watchedPaymentProvider?.configuration.display_type,
    );
  };

  return useMutation({
    mutationKey: paymentRedirectMutationKey(type, id),
    mutationFn,
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
