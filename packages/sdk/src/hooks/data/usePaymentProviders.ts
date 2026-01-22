import { useSuspenseQuery } from '@tanstack/react-query';

import { getV1PaymentProviders } from '../../__generated__';
import { PaymentConfig } from '../../types/PaymentConfig';
import {
  enrichWithPaymentConditions,
  sortTimePaymentConditions,
  splitByCategory,
} from '../../utils/paymentProviders';
import { usePaymentConfig } from './usePaymentConfig';

export const paymentProvidersQueryOptions = (providerConfig: PaymentConfig['providers']) => ({
  queryKey: ['paymentProviders'],
  queryFn: getV1PaymentProviders,
  select: (providers: Awaited<ReturnType<typeof getV1PaymentProviders>>) => {
    const mappedProviders = providers
      .filter((provider) => providerConfig[provider.id]?.is_active)
      .map(sortTimePaymentConditions)
      .map(enrichWithPaymentConditions);

    return mappedProviders.reduce(splitByCategory<(typeof mappedProviders)[number]>, {
      paymentProviders: [],
      buyNowPayLaterProviders: [],
    });
  },
});

export const usePaymentProviders = () => {
  const { data: paymentConfig } = usePaymentConfig();

  return useSuspenseQuery(paymentProvidersQueryOptions(paymentConfig.providers));
};
