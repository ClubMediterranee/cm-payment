import { noop, useMutation } from '@tanstack/react-query';

import type { ProviderParametersModel } from '../../../__generated__/index.schemas';
import type { CapsFormSchema } from '../../../schemas/capsFormSchema';
import { useCapsConfigContext } from '../../utils/useCapsConfigContext';
import { usePaymentConfig } from '../usePaymentConfig';
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
  const { data: paymentConfig } = usePaymentConfig();

  const mutationFn = (formData: CapsFormSchema) => {
    const displayType = paymentConfig?.providers[formData.provider_id]?.display_type;
    return getPaymentRedirectUrl(formData, { type, id, customerId }, displayType);
  };

  return useMutation({
    mutationKey: ['paymentRedirect'],
    mutationFn,
    onSuccess,
    onError,
    onSettled: onLoadEnd,
  });
};
