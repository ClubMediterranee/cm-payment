import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

import { useFormCallbacks } from '../contexts/FormCallbacksContext';
import { errorEvent, loadEndEvent, loadEvent, submitEvent } from '../embed/shared/events';
import { loadPaymentProviderUrl } from '../utils/loadPaymentProviderUrl';
import { usePaymentRedirect } from './data/usePaymentRedirect';
import { useTokenRetry } from './useTokenRetry';
import { useFormContext } from './utils/useForm';
import { useProviderIntegrationMode } from './utils/useProviderIntegrationMode';

export type UsePaymentSubmitParams = {
  targetIframe?: RefObject<HTMLIFrameElement>;
};

export const usePaymentSubmit = ({ targetIframe }: UsePaymentSubmitParams = {}) => {
  const { onEvent } = useFormCallbacks();
  const methods = useFormContext();
  const { iframe, custom } = useProviderIntegrationMode();

  const { mutate, ...mutationProps } = usePaymentRedirect({
    onError: (error) => {
      onEvent?.(errorEvent({ code: 'FLOW_ERROR', message: error.message }));
    },
    onSuccess: ({ redirect }) => {
      if (custom) return;
      loadPaymentProviderUrl(redirect, targetIframe);
    },
    onLoadEnd: () => onEvent?.(loadEndEvent),
    skipLoadEndOnSuccess: !custom,
  });

  const { isPending } = mutationProps;

  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const { handleTokenValidationError } = useTokenRetry({
    onRetry: () => mutate(methods.getValues()),
  });

  useEffect(() => {
    if (isPending && !iframe) {
      onEventRef.current?.(loadEvent);
    }
  }, [iframe, isPending]);

  const handleSubmit = async (e?: React.FormEvent) => {
    await methods.handleSubmit((data) => {
      onEvent?.(
        submitEvent({
          provider_id: data.provider_id,
          amount: Number(data.amount),
          currency: data.currency,
        }),
      );
      mutate(data);
    }, handleTokenValidationError)(e);
  };

  return { handleSubmit, ...mutationProps };
};
