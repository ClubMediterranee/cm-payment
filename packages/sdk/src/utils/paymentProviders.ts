import type { PaymentProvider1 } from '../__generated__/index.schemas';
import { PaymentProvider1CategoryPaymentMethod } from '../__generated__/index.schemas';

export const sortTimePaymentConditions = <T extends PaymentProvider1>(provider: T): T => ({
  ...provider,
  payment_methods: provider.payment_methods?.map((method) => ({
    ...method,
    time_payment_conditions: method.time_payment_conditions
      ? [...method.time_payment_conditions].sort(
          (a, b) => (a.payment_count || 0) - (b.payment_count || 0),
        )
      : method.time_payment_conditions,
  })),
});

export const enrichWithPaymentConditions = <T extends PaymentProvider1>(provider: T) => {
  const payment_conditions =
    provider.payment_methods?.reduce(
      (acc, method) => {
        const key = method.label || method.id;
        acc[key] = method.time_payment_conditions || [];
        return acc;
      },
      {} as Record<
        string,
        NonNullable<PaymentProvider1['payment_methods']>[number]['time_payment_conditions']
      >,
    ) ?? {};

  return {
    ...provider,
    payment_conditions,
  };
};

export const splitByCategory = <T extends PaymentProvider1>(
  acc: { paymentProviders: T[]; buyNowPayLaterProviders: T[] },
  provider: T,
) => {
  if (provider.category_payment_method === PaymentProvider1CategoryPaymentMethod.BuyNowPayLater) {
    acc.buyNowPayLaterProviders.push(provider);
  } else {
    acc.paymentProviders.push(provider);
  }
  return acc;
};

export const getDefaultPaymentConditionId = (
  provider?: ReturnType<typeof enrichWithPaymentConditions>,
) => {
  if (!provider?.payment_conditions) return undefined;
  return Object.values(provider.payment_conditions)[0]?.[0]?.id;
};
