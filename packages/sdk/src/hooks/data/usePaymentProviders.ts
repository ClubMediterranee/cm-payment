import { useSuspenseQuery } from '@tanstack/react-query';

import { getV1PaymentProviders } from '../../__generated__';
import { useOidcContext } from '../utils/useSDKPaymentContext';

export const usePaymentProviders = () => {
  const { withAuth } = useOidcContext();

  return useSuspenseQuery({
    queryKey: ['paymentProviders'],
    queryFn: () => getV1PaymentProviders({ withAuth }),
    retry: false,
  });
};
