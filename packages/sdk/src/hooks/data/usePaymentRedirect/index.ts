import { noop, useMutation, useMutationState } from '@tanstack/react-query';

import type { ProviderParametersModel } from '../../../__generated__/index.schemas';
import type { CapsFormSchema } from '../../../schemas/capsFormSchema';
import type { CallbackUrls } from '../../../utils/url/getRedirectPaymentCallbackUrls';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';

export type PaymentRedirectResult = {
  redirect: ProviderParametersModel;
  payment: { paymentId: string; callbacks: CallbackUrls };
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

  const mutationFn = (formData: CapsFormSchema) => {
    return getPaymentRedirectUrl(
      formData,
      { type, id, customerId },
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
