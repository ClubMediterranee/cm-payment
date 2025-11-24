import { useEffect } from 'react';

import { usePaymentRedirect } from './data/usePaymentRedirect';
import { useTokenRetry } from './useTokenRetry';
import { useFormContext } from './utils/useForm';

export type UsePaymentSubmitParams = {
  onError?: (error: Error) => void;
  onLoad?: () => void;
  onLoadEnd?: () => void;
};

export const usePaymentSubmit = ({ onError, onLoad, onLoadEnd }: UsePaymentSubmitParams) => {
  const methods = useFormContext();

  const { mutate, isPending } = usePaymentRedirect({
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onLoadEnd,
  });

  const { handleTokenValidationError } = useTokenRetry({
    onRetry: () => mutate(methods.getValues()),
  });

  useEffect(() => {
    if (isPending) {
      onLoad?.();
    }
  }, [isPending, onLoad]);

  const handleSubmit = async (e: React.FormEvent) => {
    await methods.handleSubmit((data) => mutate(data), handleTokenValidationError)(e);
  };

  return { handleSubmit, isPending };
};
