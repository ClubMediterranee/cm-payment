import { getV1PaymentProviders } from '../../../__generated__';
import { PaymentProviderListModel2 } from '../../../__generated__/index.schemas';
import { sdkQueryClient } from '../../../providers/QueryClientProvider';
import { PaymentConfig } from '../../../types/PaymentConfig';
import { daysUntilToday, parseApiDate } from '../../../utils/formatDate';
import { stayQueryOptions } from '../useStay';

export type PaymentProviderWithConfiguration = PaymentProviderListModel2[number] & {
  configuration: PaymentConfig['providers'][string];
};

export const getPaymentProviders = async ({
  providerConfig,
  id,
  type,
  customerId,
}: {
  providerConfig: PaymentConfig['providers'];
  id: string;
  type: 'booking' | 'proposal';
  customerId?: string;
}): Promise<PaymentProviderWithConfiguration[]> => {
  const paymentProviders = await getV1PaymentProviders();

  const paymentProvidersWithConfiguration = paymentProviders.map((paymentProvider) => {
    return {
      ...paymentProvider,
      configuration: providerConfig[paymentProvider.id],
    };
  });

  const shouldFetchStay = paymentProvidersWithConfiguration.some(
    ({ configuration: { is_active, settings: { min_days_before_departure } = {} } }) =>
      is_active && !!min_days_before_departure,
  );

  const stay = shouldFetchStay
    ? await sdkQueryClient.fetchQuery(stayQueryOptions({ type, id, customerId }))
    : null;

  return paymentProvidersWithConfiguration.filter((paymentProvider) => {
    const { is_active, settings: { min_days_before_departure } = {} } =
      providerConfig[paymentProvider.id];
    const { resortArrivalDate } = stay || {};

    return (
      is_active &&
      (!min_days_before_departure ||
        !resortArrivalDate ||
        (parseApiDate(resortArrivalDate) &&
          daysUntilToday(parseApiDate(resortArrivalDate)!) < Number(min_days_before_departure)))
    );
  });
};
