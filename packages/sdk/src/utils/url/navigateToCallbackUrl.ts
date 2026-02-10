import { IframeMessageType } from '../iframe/constants';
import { isEmbeddedInIframe } from '../iframe/isEmbeddedInIframe';
import { sendIframeMessage } from '../iframe/sendMessage';

export const navigateToCallbackUrl = ({
  callbackUrl,
  paymentResponse,
  proposalId,
}: {
  callbackUrl: string | null;
  paymentResponse: Record<string, any>;
  proposalId: string | null;
}) => {
  const params = new URLSearchParams({
    ...paymentResponse,
    ...(proposalId ? { proposal_id: proposalId } : {}),
  });

  const url = `${callbackUrl}?${params.toString()}`;

  if (isEmbeddedInIframe()) {
    sendIframeMessage({
      type: IframeMessageType.PAYMENT_REDIRECT,
      url,
    });
  } else {
    window.location.href = url;
  }
};
