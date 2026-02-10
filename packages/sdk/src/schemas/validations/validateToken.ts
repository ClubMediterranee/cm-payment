import { getProviderIntegrationMode } from '../../hooks/utils/useProviderIntegrationMode';
import type { Validate } from '../capsFormSchema';

export const validateToken: Validate = (data, { content, providersConfig }) => {
  const { hostedField } = getProviderIntegrationMode(data.provider_id, providersConfig);
  if (hostedField && !data.token?.value) {
    return {
      path: ['token', 'value'],
      message: content.paymentProviders.validation.required,
    };
  }
  return undefined;
};
