import { PspProviders } from '../../types/PspProviders';
import { usePaymentProviders } from '../data/usePaymentProviders';

export const usePaymentProviderSettings = <T extends Record<string, unknown>>(
  providerId: PspProviders,
): T => {
  const {
    data: { paymentProviders, buyNowPayLaterProviders },
  } = usePaymentProviders();

  const provider = [...paymentProviders, ...buyNowPayLaterProviders].find(
    (p) => p.id === providerId,
  );

  return (provider?.configuration?.settings ?? {}) as T;
};
