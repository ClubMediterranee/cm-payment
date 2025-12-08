import { CapsFormData } from '@clubmed/payment-sdk/types/FormData';
import { noop, useMutation } from '@tanstack/react-query';

import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';

type Props = {
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
  onLoadEnd?: () => void;
};

export const usePaymentRedirect = ({
  onError = noop,
  onSuccess = noop,
  onLoadEnd = noop,
}: Props = {}) => {
  const { type, id, customerId } = useCapsConfigContext();

  const mutationFn = (formData: CapsFormData) =>
    getPaymentRedirectUrl(formData, { type, id, customerId });

  return useMutation({
    mutationKey: ['paymentRedirect'],
    mutationFn,
    onSuccess,
    onError,
    onSettled: onLoadEnd,
  });
};
