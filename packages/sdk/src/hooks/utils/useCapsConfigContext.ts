import { CapsConfigContext } from '@clubmed/payment-sdk/contexts/CapsConfigContext';
import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings';
import { useContext } from 'react';

export const useCapsConfigContext = () => {
  return useContext(CapsConfigContext);
};

export const useOidcContext = () => {
  const { oidc } = useContext(CapsConfigContext);

  const isSeller = [OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS].includes(oidc.issuerType);

  return { isSeller };
};
