import { usePaymentRedirectState } from '../../../hooks/data/usePaymentRedirect/index.js';
import { PspProviders } from '../../../types/PspProviders.js';

export const useWeChatQRCode = () => {
  const { payment, redirect } =
    usePaymentRedirectState({ providerId: PspProviders.M99BILLW }) ?? {};

  return { payment, url: redirect?.url };
};
