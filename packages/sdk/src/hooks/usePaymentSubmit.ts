import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

import { useFormCallbacks } from '../contexts/FormCallbacksContext';
import { loadPaymentProviderUrl } from '../utils/loadPaymentProviderUrl';
import { usePaymentRedirect } from './data/usePaymentRedirect';
import { useTokenRetry } from './useTokenRetry';
import { useFormContext } from './utils/useForm';
import { useProviderIntegrationMode } from './utils/useProviderIntegrationMode';

export type UsePaymentSubmitParams = {
  targetIframe?: RefObject<HTMLIFrameElement>;
};

export const usePaymentSubmit = ({ targetIframe }: UsePaymentSubmitParams = {}) => {
  const { onError, onLoad, onLoadEnd } = useFormCallbacks();
  const methods = useFormContext();
  const { iframe, custom } = useProviderIntegrationMode();

  const { mutate, ...mutationProps } = usePaymentRedirect({
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: ({ redirect }) => {
      if (custom) return;
      loadPaymentProviderUrl(redirect, targetIframe);
    },
    onLoadEnd,
    skipLoadEndOnSuccess: !custom,
  });

  const { isPending } = mutationProps;

  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  const { handleTokenValidationError } = useTokenRetry({
    onRetry: () => mutate(methods.getValues()),
  });

  useEffect(() => {
    if (isPending && !iframe) {
      onLoadRef.current?.();
    }
  }, [iframe, isPending]);

  const handleSubmit = async (e?: React.FormEvent) => {
    await methods.handleSubmit((data) => mutate(data), handleTokenValidationError)(e);
  };

  return { handleSubmit, ...mutationProps };
};
