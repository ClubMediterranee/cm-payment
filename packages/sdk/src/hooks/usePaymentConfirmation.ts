import { useEffect } from 'react';

import { GLOBAL_CAPS_SETTINGS } from '../config';
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
      // TODO Jerome met ça dans une function comme pour le getRedirectPaymentCallbackUrl afin de faire les tests unitaires
      window.location.href = `${callbackUrl}?${new URLSearchParams({ ...paymentResponse, ...(proposalId ? { proposal_id: proposalId } : {}) }).toString()}`;
    }
  }, [callbackUrl, paymentResponse, proposalId]);
};
