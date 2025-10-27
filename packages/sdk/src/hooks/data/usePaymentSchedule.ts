import { useSuspenseQuery } from '@tanstack/react-query';

import { getPaymentSchedule } from './usePaymentSchedule/getPaymentSchedule';
import { selectPaymentSchedule } from './usePaymentSchedule/selectPaymentSchedule';

export const usePaymentSchedule = () => {
  const { data: paymentSchedule, isSuccess } = useSuspenseQuery({
    queryKey: ['paymentSchedule'],
    queryFn: getPaymentSchedule,
    retry: false,
    select: selectPaymentSchedule,
  });

  return { paymentSchedule, isSuccess };
};
