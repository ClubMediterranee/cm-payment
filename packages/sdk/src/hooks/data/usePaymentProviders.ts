import { PaymentConfig } from '@clubmed/payment-sdk/types/PaymentConfig';
import { useSuspenseQuery } from '@tanstack/react-query';

import { getV1PaymentProviders, PaymentProvider1CategoryPaymentMethod } from '../../__generated__';
import { usePaymentConfig } from './usePaymentConfig';

export const paymentProvidersQueryOptions = (providerConfig: PaymentConfig['providers']) => ({
  queryKey: ['paymentProviders'],
  queryFn: getV1PaymentProviders,
  select: (providers: Awaited<ReturnType<typeof getV1PaymentProviders>>) => {
    return providers
      .filter((provider) => providerConfig[provider.id]?.is_active)
      .reduce(
        (acc, provider) => {
          if (
            provider.category_payment_method ===
            PaymentProvider1CategoryPaymentMethod.BuyNowPayLater
          ) {
            acc.buyNowPayLaterProviders.push(provider);
          } else {
            acc.paymentProviders.push(provider);
          }
          return acc;
        },
        {
          paymentProviders: [] as typeof providers,
          buyNowPayLaterProviders: [] as typeof providers,
        },
      );
  },
});

export const usePaymentProviders = () => {
  const { data: paymentConfig } = usePaymentConfig();

  return useSuspenseQuery(paymentProvidersQueryOptions(paymentConfig.providers));
};
