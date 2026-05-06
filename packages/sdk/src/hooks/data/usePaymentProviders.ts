import { useSuspenseQuery } from '@tanstack/react-query';

import { paymentProvidersControllerGetPaymentProviders } from '../../__generated__/bff';
import { useCapsConfigContext } from '../utils/useCapsConfigContext';

export const paymentProvidersQueryOptions = ({
  id,
  type,
  customerId,
}: {
  id: string;
  type: 'booking' | 'proposal';
  customerId?: string;
}) => ({
  queryKey: ['paymentProviders', id, type, customerId],
  queryFn: async () => {
    const { payment_providers = [], buy_now_pay_later_providers = [] } =
      await paymentProvidersControllerGetPaymentProviders(type, id, {
        customer_id: customerId,
      });
    return {
      paymentProviders: payment_providers,
      buyNowPayLaterProviders: buy_now_pay_later_providers,
    };
  },
});

export const usePaymentProviders = () => {
  const { type, id, customerId } = useCapsConfigContext();

  return useSuspenseQuery(
    paymentProvidersQueryOptions({
      type: type as 'booking' | 'proposal',
      id: id!,
      customerId,
    }),
  );
};
