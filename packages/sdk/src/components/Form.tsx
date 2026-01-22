import { PropsWithChildren } from 'react';

import { usePaymentSubmit } from '../hooks/usePaymentSubmit';

export function Form({ children }: PropsWithChildren) {
  const { handleSubmit } = usePaymentSubmit();

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      className="w-full flex flex-col justify-center items-center gap-24 text-b4"
    >
      {children}
    </form>
  );
}
