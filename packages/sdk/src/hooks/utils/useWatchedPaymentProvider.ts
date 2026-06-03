import { usePaymentProviders } from '../data/usePaymentProviders';
import { useWatch } from './useForm';

export const useWatchedPaymentProvider = () => {
  const {
    data: { paymentProviders, buyNowPayLaterProviders },
  } = usePaymentProviders();
  const watchedProviderId = useWatch('provider_id');

  return [...paymentProviders, ...buyNowPayLaterProviders].find(
    (provider) => provider.id === watchedProviderId,
  );
};
