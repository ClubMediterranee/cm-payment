import { useSuspenseQuery } from '@tanstack/react-query';

import { paymentScheduleControllerGetPaymentSchedules } from '../../../__generated__/bff';
import { Action } from '../../../__generated__/index.schemas';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getResolvedAction } from '../useActionResolver';

export const PAYMENT_SCHEDULE_QUERY_KEY = (id: string, action?: Action) => [
  'paymentSchedule',
  id,
  action,
];

export const paymentScheduleQueryOptions = (id: string, customer_id?: string) => {
  const action = getResolvedAction();
  return {
    queryKey: PAYMENT_SCHEDULE_QUERY_KEY(id, action),
    queryFn: () => paymentScheduleControllerGetPaymentSchedules(id, { action, customer_id }),
  };
};

export const usePaymentSchedule = () => {
  const { id, customerId } = useCapsConfigContext();

  const { data: paymentSchedule } = useSuspenseQuery(paymentScheduleQueryOptions(id, customerId));

  return { paymentSchedule };
};
