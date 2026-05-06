import {
  PaymentMethodModel4,
  TimePaymentConditionModel,
} from '../../../infra/api/__generated__/index.schemas.js';
import { EnrichedPaymentProvider } from '../models.js';

export const sortTimePaymentConditions = (
  provider: EnrichedPaymentProvider,
): EnrichedPaymentProvider => ({
  ...provider,
  payment_methods: (provider as any).payment_methods?.map((method: PaymentMethodModel4) => ({
    ...method,
    time_payment_conditions: method.time_payment_conditions
      ? [...method.time_payment_conditions].sort(
          (a: TimePaymentConditionModel, b: TimePaymentConditionModel) =>
            (a.payment_count || 0) - (b.payment_count || 0),
        )
      : method.time_payment_conditions,
  })),
});
