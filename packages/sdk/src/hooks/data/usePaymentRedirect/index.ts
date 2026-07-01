import { noop, useMutation, useMutationState } from '@tanstack/react-query';

import type { CapsFormSchema } from '../../../schemas/capsFormSchema';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { useWatchedPaymentProvider } from '../../utils/useWatchedPaymentProvider';
import { getPaymentRedirect } from './getPaymentRedirect';

const paymentRedirectMutationKey = (type: string, id: string) => ['paymentRedirect', type, id];

type PaymentRedirectResult = Awaited<ReturnType<typeof getPaymentRedirect>>;

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
  const { type, id, customerId, callbackUrlSeller } = useCapsConfigContext();

  const watchedPaymentProvider = useWatchedPaymentProvider();

  return useMutation({
    mutationKey: paymentRedirectMutationKey(type, id),
    mutationFn: (formData: CapsFormSchema) =>
      getPaymentRedirect(
        formData,
        { type, id, customerId, callbackUrlSeller },
        watchedPaymentProvider,
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
