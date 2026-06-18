import type { PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItem } from '../__generated__/bff/index.schemas';

export const getDefaultPaymentConditionId = (
  provider?: PaymentProvidersControllerGetPaymentProviders200PaymentProvidersItem,
) => {
  if (!provider?.payment_conditions) return undefined;
  return Object.values(provider.payment_conditions)[0]?.[0]?.id;
};
