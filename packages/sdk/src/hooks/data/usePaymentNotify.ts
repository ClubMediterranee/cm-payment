import { useQuery } from '@tanstack/react-query';

import { postV1PaymentsPaymentIdNotify } from '../../__generated__';

export const usePaymentNotify = ({
  paymentId,
  enabled,
}: {
  paymentId: string;
  enabled?: boolean;
}) => {
  const search = new URLSearchParams(document.location.search);

  return useQuery({
    queryKey: ['notify', paymentId],
    queryFn: () =>
      postV1PaymentsPaymentIdNotify(paymentId, { provider_response: search.toString() }),
    enabled,
    retry: false,
  });
};
