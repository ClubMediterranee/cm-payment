import { useSuspenseQuery } from '@tanstack/react-query';

import { paymentProvidersControllerGetPaymentProviders } from '../../__generated__/bff';
import { useCapsConfigContext } from '../utils/useCapsConfigContext';
import { getResolvedAction } from './useActionResolver';

export const paymentProvidersQueryOptions = ({
  id,
  type,
  customerId,
}: {
  id: string;
  type: 'booking' | 'proposal';
  customerId?: string;
}) => {
  const action = getResolvedAction();

  return {
    queryKey: ['paymentProviders', id, type, customerId, action],
    queryFn: async () => {
      const { payment_providers = [], buy_now_pay_later_providers = [] } =
        await paymentProvidersControllerGetPaymentProviders(type, id, {
          customer_id: customerId,
          action,
        });
      return {
        paymentProviders: payment_providers,
        buyNowPayLaterProviders: buy_now_pay_later_providers,
      };
    },
  };
};

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
