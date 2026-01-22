import { PaymentConfig } from '../../types/PaymentConfig';
import { usePaymentConfig } from '../data/usePaymentConfig';
import { useWatch } from './useForm';

export const getProviderIntegrationMode = (
  providerId: string,
  providersConfig: PaymentConfig['providers'],
) => {
  const displayType = providersConfig[providerId]?.display_type;
  return {
    iframe: displayType === 'iframe',
    redirect: displayType === 'redirect',
    hostedField: displayType === 'hosted_field',
  };
};

export const useProviderIntegrationMode = () => {
  const { data: paymentConfig } = usePaymentConfig();
  const providerId = useWatch('provider_id');

  return getProviderIntegrationMode(providerId, paymentConfig.providers);
};
