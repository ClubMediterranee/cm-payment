import type { Validate } from '../capsFormSchema';

export const validatePaymentCondition: Validate = (data, { content, requiresPaymentCondition }) => {
  if (requiresPaymentCondition?.(data.provider_id) && !data.payment_condition_id) {
    return {
      path: ['payment_condition_id'],
      message: content.cardInstallments.validation.conditionRequired,
    };
  }

  return undefined;
};
