import { SDKFormData } from '@clubmed/payment-sdk/types/FormData';
import { COOKIE_KEYS, setCookie } from '@clubmed/payment-sdk/utils/storage/cookies';
import { noop, useMutation } from '@tanstack/react-query';

import { useOidcContext, useSDKPaymentContext } from '../utils/useSDKPaymentContext';
import { getPaymentRedirectUrl } from './usePaymentRedirect/getPaymentRedirectUrl';

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
  const { proposalId, bookingId, action, customerId, callbackUrl } = useSDKPaymentContext();

  const { withAuth } = useOidcContext();

  if (callbackUrl) {
    setCookie(COOKIE_KEYS.CALLBACK_URL, callbackUrl);
  }

  const mutationFn = (formData: SDKFormData) =>
    getPaymentRedirectUrl(formData, { withAuth, proposalId, bookingId, action, customerId });

  return useMutation({
    mutationKey: ['paymentRedirect'],
    mutationFn,
    onSuccess,
    onError,
    onSettled: onLoadEnd,
  });
};
