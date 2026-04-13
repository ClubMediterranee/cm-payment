import {
  enrichWithPaymentConditions,
  sortTimePaymentConditions,
  splitByCategory,
} from '../../../utils/paymentProviders';
import { getPaymentProviders } from './getPaymentProviders';

export const selectPaymentProviders = (
  providers: Awaited<ReturnType<typeof getPaymentProviders>>,
) => {
  const mappedProviders = providers.map(sortTimePaymentConditions).map(enrichWithPaymentConditions);

  return mappedProviders.reduce(splitByCategory<(typeof mappedProviders)[number]>, {
    paymentProviders: [],
    buyNowPayLaterProviders: [],
  });
};
