import { PropsWithChildren } from 'react';

import { usePaymentSubmit, UsePaymentSubmitParams } from '../hooks/usePaymentSubmit';

export function Form({
  children,
  onError,
  onLoad,
  onLoadEnd,
}: PropsWithChildren<UsePaymentSubmitParams>) {
  const { handleSubmit } = usePaymentSubmit({ onError, onLoad, onLoadEnd });

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col justify-center items-center gap-24 text-b4"
    >
      {children}
    </form>
  );
}
