import { useQuery } from '@tanstack/react-query';

import { getV0PaymentsPaymentIdStatus } from '../../../__generated__';
import { getPaymentStatusRefetchInterval } from './getPaymentStatusRefetchInterval';
import { selectPaymentStatus } from './selectPaymentStatus';

type Options = { enabled?: boolean; pollIntervalMs?: number };

export const usePaymentStatus = (paymentId?: string, { enabled, pollIntervalMs }: Options = {}) => {
  const refetchInterval = getPaymentStatusRefetchInterval(pollIntervalMs);

  return useQuery({
    enabled,
    queryKey: ['paymentStatus', paymentId],
    queryFn: () => getV0PaymentsPaymentIdStatus(paymentId!),
    select: selectPaymentStatus,
    refetchInterval: ({ state }) => refetchInterval(state.data),
  });
};
