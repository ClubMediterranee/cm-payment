import { getProviderIntegrationMode } from '../../hooks/utils/useProviderIntegrationMode';
import { PspProviders } from '../../types/PspProviders';
import type { Validate } from '../capsFormSchema';

const PROVIDERS_WITH_EXPIRY_DATE = [PspProviders.MCYBERSOURCE];

export const validateExpiryDate: Validate = (data, { content, providersConfig }) => {
  const { hostedField } = getProviderIntegrationMode(data.provider_id, providersConfig);

  if (!hostedField || !PROVIDERS_WITH_EXPIRY_DATE.includes(data.provider_id as PspProviders)) {
    return undefined;
  }

  const expiryDate = data.creditCard?.expiryDate;

  if (!expiryDate) {
    return {
      path: ['creditCard', 'expiryDate'],
      message: content.creditCardForm.validation.expiryDate,
    };
  }

  const date = new Date(expiryDate);
  const now = new Date();

  if (date <= now) {
    return {
      path: ['creditCard', 'expiryDate'],
      message: content.creditCardForm.validation.expired,
    };
  }

  return undefined;
};
