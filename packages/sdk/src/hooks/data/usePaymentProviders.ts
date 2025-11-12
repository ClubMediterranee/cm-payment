import { hasFlip } from '@clubmed/payment-sdk/utils/featureFlips';
import { useSuspenseQuery } from '@tanstack/react-query';

import { getV1PaymentProviders } from '../../__generated__';

export const paymentProvidersQueryOptions = {
  queryKey: ['paymentProviders'],
  queryFn: getV1PaymentProviders,
  select: (providers: Awaited<ReturnType<typeof getV1PaymentProviders>>) =>
    providers.filter((provider) => hasFlip(`psp.${provider.id.toLowerCase()}`)),
  retry: false,
};

export const usePaymentProviders = () => {
  return useSuspenseQuery(paymentProvidersQueryOptions);
};
