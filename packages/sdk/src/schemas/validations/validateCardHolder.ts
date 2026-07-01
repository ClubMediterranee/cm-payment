import type { Validate } from '../capsFormSchema';

export const validateCardHolder: Validate = (data, { content, getProviderValidation }) => {
  const validation = getProviderValidation(data.provider_id);

  if (!validation?.requires_card_holder) {
    return undefined;
  }

  const cardHolder = data.creditCard?.cardHolder;

  if (!cardHolder) {
    return {
      path: ['creditCard', 'cardHolder'],
      message: content.creditCardForm.validation.cardHolder,
    };
  }

  return undefined;
};
