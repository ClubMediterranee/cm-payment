import { useSuspenseQuery } from '@tanstack/react-query';

import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getPaymentSchedule } from './getPaymentSchedule';
import { selectPaymentSchedule } from './selectPaymentSchedule';

export const paymentScheduleQueryOptions = (id: string) => ({
  queryKey: ['paymentSchedule', id],
  queryFn: getPaymentSchedule,
  select: selectPaymentSchedule,
});

export const usePaymentSchedule = () => {
  const { id } = useCapsConfigContext();
  const { data: paymentSchedule } = useSuspenseQuery(paymentScheduleQueryOptions(id));

  return { paymentSchedule };
};
