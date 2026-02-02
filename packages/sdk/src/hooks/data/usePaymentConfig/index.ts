import { useSuspenseQuery } from '@tanstack/react-query';

import type { OidcIssuerTypes } from '../../../types/CapsSettings';
import type { PaymentConfig } from '../../../types/PaymentConfig';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getPaymentConfig } from './getPaymentConfig';

export const PAYMENT_CONFIG_QUERY_KEY = (locale: string, issuerType: OidcIssuerTypes) => [
  'paymentConfig',
  locale,
  issuerType,
];

export const usePaymentConfig = () => {
  const { locale, oidc } = useCapsConfigContext();
  return useSuspenseQuery<PaymentConfig>({
    queryKey: PAYMENT_CONFIG_QUERY_KEY(locale, oidc.issuerType),
    queryFn: () => getPaymentConfig({ issuerType: oidc.issuerType, locale }),
    staleTime: 'static',
    gcTime: Infinity,
  });
};
