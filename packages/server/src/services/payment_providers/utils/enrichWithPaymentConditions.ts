import {
  PaymentMethodModel4,
  TimePaymentConditionModel,
} from '../../../infra/api/__generated__/index.schemas.js';
import { EnrichedPaymentProvider } from '../models.js';

export const enrichWithPaymentConditions = (
  provider: EnrichedPaymentProvider,
): EnrichedPaymentProvider => {
  const payment_conditions =
    provider.payment_methods?.reduce(
      (acc: Record<string, TimePaymentConditionModel[]>, method: PaymentMethodModel4) => {
        const key = method.label || method.id;
        acc[key] = method.time_payment_conditions || [];
        return acc;
      },
      {} as Record<string, TimePaymentConditionModel[]>,
    ) ?? {};

  return {
    ...provider,
    payment_conditions,
  };
};
