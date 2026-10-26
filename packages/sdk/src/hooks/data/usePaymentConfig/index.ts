import { useSuspenseQuery } from '@tanstack/react-query';

import type { PaymentConfig } from '../../../__generated__/bff/index.schemas';
import { fetcher, type FetcherConfig } from '../../../utils/fetcher';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';

export const PAYMENT_CONFIG_QUERY_KEY = ['paymentConfig'];

export const paymentConfigQueryOptions = (config: FetcherConfig) => ({
  queryKey: [...PAYMENT_CONFIG_QUERY_KEY, config.api.url, config.locale, config.oidc.issuerType],
  queryFn: () => fetcher<PaymentConfig>({ url: '/rest/payment_config', method: 'GET', config }),
});

export const usePaymentConfig = () => {
  const { locale, oidc, api } = useCapsConfigContext();

  return useSuspenseQuery(paymentConfigQueryOptions({ locale, oidc, api }));
};
