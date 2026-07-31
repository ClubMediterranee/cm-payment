import { PropsWithChildren } from 'react';

import { useOverpaymentSubmit } from '../hooks/useOverpaymentSubmit';
import { OverpaymentConfirmationPopin } from './ui/OverpaymentConfirmationPopin';

export function Form({ children }: PropsWithChildren) {
  const { onSubmit, isConfirmOpen, onConfirm, onCancel } = useOverpaymentSubmit();

  return (
    <>
      <form
        id="payment-form"
        onSubmit={onSubmit}
        className="w-full flex flex-col justify-center items-center gap-24 text-b4"
      >
        {children}
      </form>
      <OverpaymentConfirmationPopin
        isOpen={isConfirmOpen}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
}
