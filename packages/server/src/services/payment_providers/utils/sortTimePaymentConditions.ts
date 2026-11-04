import {
  PaymentMethodModel4,
  TimePaymentConditionModel,
} from '../../../infra/api/__generated__/index.js';

export const sortTimePaymentConditions = (
  paymentMethods: PaymentMethodModel4[] | undefined,
): PaymentMethodModel4[] | undefined =>
  paymentMethods?.map((method) => ({
    ...method,
    time_payment_conditions: method.time_payment_conditions
      ? [...method.time_payment_conditions].sort(
          (a: TimePaymentConditionModel, b: TimePaymentConditionModel) =>
            (a.payment_count ?? 0) - (b.payment_count ?? 0),
        )
      : method.time_payment_conditions,
  }));
