import { useQuery } from '@tanstack/react-query';

import { paymentScheduleControllerGetOverpaymentAllowance } from '../../__generated__/bff';
import { useCapsConfigContext } from '../utils/useCapsConfigContext';

export const overpaymentAllowanceQueryOptions = (bookingId: string, customerId?: string) => ({
  queryKey: ['overpaymentAllowance', bookingId, customerId],
  queryFn: () =>
    paymentScheduleControllerGetOverpaymentAllowance(bookingId, { customer_id: customerId }),
});

export const useOverpaymentAllowance = ({ enabled }: { enabled: boolean }) => {
  const { id, customerId } = useCapsConfigContext();
  return useQuery({
    ...overpaymentAllowanceQueryOptions(id, customerId),
    enabled,
    placeholderData: { amount: 0 },
  });
};
