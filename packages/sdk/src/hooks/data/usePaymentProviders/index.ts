import { useSuspenseQuery } from '@tanstack/react-query';

import { PaymentConfig } from '../../../types/PaymentConfig';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { usePaymentConfig } from '../usePaymentConfig';
import { getPaymentProviders } from './getPaymentProviders';
import { selectPaymentProviders } from './selectPaymentProviders';

export const paymentProvidersQueryOptions = ({
  providerConfig,
  id,
  type,
  customerId,
}: {
  providerConfig: PaymentConfig['providers'];
  id: string;
  type: 'booking' | 'proposal';
  customerId?: string;
}) => ({
  queryKey: ['paymentProviders', id, type],
  queryFn: () =>
    getPaymentProviders({
      providerConfig,
      id,
      type,
      customerId,
    }),
  select: selectPaymentProviders,
});

export const usePaymentProviders = () => {
  const { data: paymentConfig } = usePaymentConfig();
  const { type, id, customerId } = useCapsConfigContext();

  return useSuspenseQuery(
    paymentProvidersQueryOptions({
      providerConfig: paymentConfig.providers,
      type: type as 'booking' | 'proposal',
      id: id!,
      customerId,
    }),
  );
};
