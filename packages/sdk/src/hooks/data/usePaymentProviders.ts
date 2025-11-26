import { PaymentConfig } from '@clubmed/payment-sdk/types/PaymentConfig';
import { useSuspenseQuery } from '@tanstack/react-query';

import { getV1PaymentProviders } from '../../__generated__';
import { usePaymentConfig } from './usePaymentConfig';

export const paymentProvidersQueryOptions = (providerConfig: PaymentConfig['providers']) => ({
  queryKey: ['paymentProviders'],
  queryFn: getV1PaymentProviders,
  select: (providers: Awaited<ReturnType<typeof getV1PaymentProviders>>) => {
    return providers.filter((provider) => providerConfig[provider.id]?.is_active);
  },
});

export const usePaymentProviders = () => {
  const { data: paymentConfig } = usePaymentConfig();

  return useSuspenseQuery(paymentProvidersQueryOptions(paymentConfig.providers));
};
