import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings';
import { PaymentConfig } from '@clubmed/payment-sdk/types/PaymentConfig';
import { useSuspenseQuery } from '@tanstack/react-query';

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
