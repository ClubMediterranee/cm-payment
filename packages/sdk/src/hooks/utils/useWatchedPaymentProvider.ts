import { usePaymentProviders } from '../data/usePaymentProviders';
import { useWatch } from './useForm';

export const useWatchedPaymentProvider = () => {
  const { data: paymentProviders } = usePaymentProviders();
  const watchedProviderId = useWatch('provider_id');

  return paymentProviders?.find((provider) => provider.id === watchedProviderId);
};
