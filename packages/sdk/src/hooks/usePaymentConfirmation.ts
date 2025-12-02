import { useEffect } from 'react';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { redirectToCallbackUrl } from '../utils/url/redirectToCallbackUrl';
import { usePaymentNotify } from './data/usePaymentNotify';
import { usePaymentStatus } from './data/usePaymentStatus';

export const usePaymentConfirmation = ({ paymentId }: { paymentId: string }) => {
  const search = new URLSearchParams(document.location.search);

  const proposalId = search.get('proposal_id');
  const callbackUrl = search.get('callback_url');
  const providerId = search.get('provider_id');
  const shouldPollStatus = GLOBAL_CAPS_SETTINGS.serverValidationProviders.includes(
    providerId as any,
  );

  const { data: paymentStatus } = usePaymentStatus({ paymentId, enabled: shouldPollStatus });
  const { data: paymentNotify } = usePaymentNotify({ paymentId, enabled: !shouldPollStatus });

  const paymentResponse = paymentStatus! || paymentNotify!;

  useEffect(() => {
    if (paymentResponse && paymentResponse.payment_status !== 'PENDING') {
      redirectToCallbackUrl({ callbackUrl, paymentResponse, proposalId });
    }
  }, [callbackUrl, paymentResponse, proposalId]);
};
