import { isServerValidationProvidersEnabled } from '@clubmed/payment-sdk/utils/validation/isServerValidationProvidersEnabled';
import { useQuery } from '@tanstack/react-query';

import { postV1PaymentsPaymentIdNotify } from '../../__generated__';

export const usePaymentNotify = ({ paymentId }: { paymentId: string }) => {
  const search = new URLSearchParams(document.location.search);
  const provider_id = search.get('provider_id') as string;

  return useQuery({
    queryKey: ['notify'],
    queryFn: () =>
      postV1PaymentsPaymentIdNotify(paymentId, { provider_response: search.toString() }),
    enabled: isServerValidationProvidersEnabled(paymentId, provider_id),
    retry: false,
  });
};
