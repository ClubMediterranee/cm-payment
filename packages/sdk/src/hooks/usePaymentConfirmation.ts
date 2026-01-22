import { useEffect } from 'react';

import { GLOBAL_CAPS_SETTINGS } from '../config';
import { IframeMessageType } from '../utils/iframe/constants';
import { isEmbeddedInIframe } from '../utils/iframe/isEmbeddedInIframe';
import { sendIframeMessage } from '../utils/iframe/sendMessage';
import { navigateToCallbackUrl } from '../utils/url/navigateToCallbackUrl';
import { usePaymentNotify } from './data/usePaymentNotify';
import { usePaymentStatus } from './data/usePaymentStatus';

export const usePaymentConfirmation = ({ paymentId }: { paymentId: string }) => {
  const search = new URLSearchParams(document.location.search);

  const proposalId = search.get('proposal_id');
  const callbackUrl = search.get('callback_url');
  const providerId = search.get('provider_id');

  const embedded = isEmbeddedInIframe();

  const shouldPollStatus = GLOBAL_CAPS_SETTINGS.serverValidationProviders.some((provider) =>
    providerId?.startsWith(provider),
  );

  useEffect(() => {
    if (embedded) {
      sendIframeMessage({
        type: IframeMessageType.PAYMENT_REDIRECT_LOADING,
      });
    }
  }, [embedded]);

  const { data: paymentStatus } = usePaymentStatus({ paymentId, enabled: shouldPollStatus });
  const { data: paymentNotify } = usePaymentNotify({ paymentId, enabled: !shouldPollStatus });

  const paymentResponse = paymentStatus! || paymentNotify!;

  useEffect(() => {
    if (paymentResponse && paymentResponse.payment_status !== 'PENDING') {
      if (embedded && paymentResponse.payment_status === 'CANCELED') {
        sendIframeMessage({
          type: IframeMessageType.PAYMENT_REDIRECT_CANCEL,
        });
      } else {
        navigateToCallbackUrl({ callbackUrl, paymentResponse, proposalId });
      }
    }
  }, [callbackUrl, paymentResponse, proposalId, embedded]);

  return { showLoader: !embedded };
};
