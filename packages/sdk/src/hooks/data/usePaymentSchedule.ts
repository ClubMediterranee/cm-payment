import { useSuspenseQuery } from '@tanstack/react-query';

import { useSDKPaymentContext } from '../utils/useSDKPaymentContext';
import { getPaymentSchedule } from './usePaymentSchedule/getPaymentSchedule';
import { selectPaymentSchedule } from './usePaymentSchedule/selectPaymentSchedule';

export const usePaymentSchedule = () => {
  const { proposalId, bookingId, customerId } = useSDKPaymentContext();

  const { data: paymentSchedule } = useSuspenseQuery({
    queryKey: ['paymentSchedule'],
    queryFn: () => getPaymentSchedule({ bookingId, proposalId, customerId }),
    retry: false,
    select: selectPaymentSchedule,
  });

  return { paymentSchedule };
};
