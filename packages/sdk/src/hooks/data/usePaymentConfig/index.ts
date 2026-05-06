import { useSuspenseQuery } from '@tanstack/react-query';

import { paymentConfigControllerGetPaymentConfig } from '../../../__generated__/bff';

export const PAYMENT_CONFIG_QUERY_KEY = ['paymentConfig'];

export const paymentConfigQueryOptions = () => ({
  queryKey: PAYMENT_CONFIG_QUERY_KEY,
  queryFn: () => paymentConfigControllerGetPaymentConfig(),
});

export const usePaymentConfig = () => {
  return useSuspenseQuery(paymentConfigQueryOptions());
};
