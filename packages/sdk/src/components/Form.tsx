import { PropsWithChildren } from 'react';

import { FormSubmitContext } from '../contexts/FormSubmitContext';
import { useOverpaymentSubmit } from '../hooks/useOverpaymentSubmit';
import { OverpaymentConfirmationPopin } from './ui/OverpaymentConfirmationPopin';

export function Form({ children }: PropsWithChildren) {
  const { onSubmit, isConfirmOpen, onConfirm, onCancel } = useOverpaymentSubmit();

  return (
    <FormSubmitContext.Provider value={{ onSubmit }}>
      <form id="payment-form" onSubmit={onSubmit} className="w-full flex flex-col gap-24 text-b4">
        {children}
      </form>
      <OverpaymentConfirmationPopin
        isOpen={isConfirmOpen}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </FormSubmitContext.Provider>
  );
}
