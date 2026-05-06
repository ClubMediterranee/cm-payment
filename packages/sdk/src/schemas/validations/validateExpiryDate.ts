import type { Validate } from '../capsFormSchema';

export const validateExpiryDate: Validate = (data, { content, getProviderValidation }) => {
  const validation = getProviderValidation(data.provider_id);

  if (!validation?.requires_expiry_date) {
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
