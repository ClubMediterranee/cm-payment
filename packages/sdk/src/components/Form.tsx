import { PropsWithChildren, useEffect } from 'react';

import { usePaymentRedirect } from '../hooks/data/usePaymentRedirect';
import { useFormContext } from '../hooks/utils/useForm';

type Props = {
  /**
   * events
   */
  onLoad?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
};

export function Form({ children, onError, onLoad }: PropsWithChildren<Props>) {
  const methods = useFormContext();

  const { mutate, isPending } = usePaymentRedirect({
    onError: (error) => {
      onError?.(error);
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
  });

  useEffect(() => {
    if (isPending) {
      onLoad?.();
    }
  }, [isPending, onLoad]);

  return (
    <form
      onSubmit={methods.handleSubmit((formData) => mutate(formData))}
      className="w-full flex flex-col justify-center items-center gap-24 text-b4"
    >
      {children}
    </form>
  );
}
