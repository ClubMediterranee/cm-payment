import { noop, useMutation } from '@tanstack/react-query';

import type { ProviderParametersModel } from '../../../__generated__/index.schemas';
import type { CapsFormSchema } from '../../../schemas/capsFormSchema';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { getPaymentRedirectUrl } from './getPaymentRedirectUrl';

type Props = {
  onError?: (error: Error) => void;
  onSuccess?: (params: ProviderParametersModel) => void;
  onLoadEnd?: () => void;
};

export const usePaymentRedirect = ({
  onError = noop,
  onSuccess = noop,
  onLoadEnd = noop,
}: Props = {}) => {
  const { type, id, customerId } = useCapsConfigContext();

  const mutationFn = (formData: CapsFormSchema) =>
    getPaymentRedirectUrl(formData, { type, id, customerId });

  return useMutation({
    mutationKey: ['paymentRedirect'],
    mutationFn,
    onSuccess,
    onError,
    onSettled: onLoadEnd,
  });
};
