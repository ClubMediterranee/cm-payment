import type { Validate } from '../capsFormSchema';

export const validateToken: Validate = (data, { content, getProviderValidation }) => {
  const validation = getProviderValidation(data.provider_id);

  if (validation?.requires_token && !data.token?.value) {
    return {
      path: ['token', 'value'],
      message: content.paymentProviders.validation.required,
    };
  }
  return undefined;
};
