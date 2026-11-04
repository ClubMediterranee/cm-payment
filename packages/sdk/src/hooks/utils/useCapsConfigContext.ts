import { useContext } from 'react';

import { CapsConfigContext } from '../../contexts/CapsConfigContext';
import { OidcIssuerTypes } from '../../types/CapsSettings';

export const useCapsConfigContext = () => {
  return useContext(CapsConfigContext);
};

export const useOidcContext = () => {
  const { oidc } = useContext(CapsConfigContext);

  const isSeller = [OidcIssuerTypes.GO, OidcIssuerTypes.PARTNERS].includes(oidc.issuerType);

  return { isSeller };
};
