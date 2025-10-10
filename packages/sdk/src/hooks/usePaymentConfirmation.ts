import { getCookie } from '@clubmed/payment-sdk/utils/storage/cookies';
import { useEffect } from 'react';

import { usePaymentNotify } from './data/usePaymentNotify';
import { usePaymentStatus } from './data/usePaymentStatus';

export const usePaymentConfirmation = ({ paymentId }: { paymentId: string }) => {
  const callbackUrl = getCookie('callback_url');
  const search = new URLSearchParams(document.location.search);
  const proposalId = new URLSearchParams(search).get('proposal_id');

  const { data: paymentStatus } = usePaymentStatus({ paymentId });
  const { data: paymentNotify } = usePaymentNotify({ paymentId });

  const paymentResponse = paymentStatus! || paymentNotify!;

  useEffect(() => {
    if (paymentResponse && paymentResponse.payment_status !== 'PENDING') {
      // TODO Jerome met ça dans une function comme pour le getRedirectPaymentCallbackUrl afin de faire les tests unitaires
      window.location.href = `${callbackUrl}?${new URLSearchParams({ ...paymentResponse, ...(proposalId ? { spi: proposalId } : {}) }).toString()}`;
    }
  }, [callbackUrl, paymentResponse, proposalId]);
};
