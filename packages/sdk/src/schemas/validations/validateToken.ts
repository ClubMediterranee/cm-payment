import type { Validate } from '../capsFormSchema';

export const validateToken: Validate = (data, { content }) => {
  if (data.provider_id === 'MHIPAY' && !data.token?.value) {
    return {
      path: ['token', 'value'],
      message: content.paymentProviders.validation.required,
    };
  }
  return undefined;
};
