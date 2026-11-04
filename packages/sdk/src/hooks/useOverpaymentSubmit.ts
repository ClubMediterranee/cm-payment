import { useRef } from 'react';

import { usePaymentSchedule } from './data/usePaymentSchedule';
import { usePaymentSubmit } from './usePaymentSubmit';
import { useDisclosure } from './utils/useDisclosure';
import { useFormContext } from './utils/useForm';

export const useOverpaymentSubmit = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { handleSubmit, ...rest } = usePaymentSubmit();
  const { paymentSchedule } = usePaymentSchedule();
  const { watch } = useFormContext();
  const pendingEvent = useRef<React.FormEvent | undefined>(undefined);

  const dueAmount = paymentSchedule?.[0]?.amount ?? 0;
  const amount = parseFloat(watch('amount') ?? '0');

  const onSubmit = (e?: React.FormEvent) => {
    if (amount > dueAmount) {
      e?.preventDefault();
      pendingEvent.current = e;
      onOpen();
    } else {
      handleSubmit(e);
    }
  };

  const onConfirm = () => {
    onClose();
    handleSubmit(pendingEvent.current);
  };

  return { ...rest, onSubmit, isConfirmOpen: isOpen, onConfirm, onCancel: onClose };
};
