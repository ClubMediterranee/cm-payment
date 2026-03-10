import { useSuspenseQuery } from '@tanstack/react-query';

import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getPaymentSchedule } from './getPaymentSchedule';
import { selectPaymentSchedule } from './selectPaymentSchedule';

export const PAYMENT_SCHEDULE_QUERY_KEY = (id: string) => ['paymentSchedule', id];

//fetchPaymentSchedule

export const paymentScheduleQueryOptions = (id: string) => ({
  queryKey: PAYMENT_SCHEDULE_QUERY_KEY(id),
  queryFn: getPaymentSchedule,
  select: selectPaymentSchedule,
});

export const usePaymentSchedule = () => {
  const { id } = useCapsConfigContext();
  const { data: paymentSchedule } = useSuspenseQuery(paymentScheduleQueryOptions(id));

  return { paymentSchedule };
};
