import { EnrichedPaymentProvider, PaymentProvidersResponse } from '../types.js';

export const splitByCategory = (
  acc: PaymentProvidersResponse,
  provider: EnrichedPaymentProvider,
): PaymentProvidersResponse => {
  if (provider.category_payment_method === 'BuyNowPayLater') {
    acc.buy_now_pay_later_providers.push(provider);
  } else {
    acc.payment_providers.push(provider);
  }
  return acc;
};
