import { useEffect } from 'react';

import { useCapsConfigContext } from '../../hooks/utils/useCapsConfigContext';
import { IframeMessageType } from './constants';

type MessageHandler = {
  [IframeMessageType.PAYMENT_REDIRECT]?: (url: string) => void;
  [IframeMessageType.PAYMENT_REDIRECT_LOADING]?: () => void;
  [IframeMessageType.PAYMENT_REDIRECT_CANCEL]?: () => void;
};

export const useIframeMessageBridge = (handlers: MessageHandler) => {
  const { paymentGatewayUrl } = useCapsConfigContext();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(paymentGatewayUrl).origin) {
        return;
      }

      const { type, url } = event.data;
      const handler = handlers[type as keyof typeof handlers];

      if (handler) {
        handler(url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handlers, paymentGatewayUrl]);
};
