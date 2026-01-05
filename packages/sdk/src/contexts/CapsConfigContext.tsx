import { createContext } from 'react';

import { defaultContent } from '../content/default';
import { CapsSettings, ClubMedApiSettings, OidcSettings } from '../types/CapsSettings';

export const CapsConfigContext = createContext<CapsSettings>({
  type: '' as CapsSettings['type'],
  paymentGatewayUrl: '',
  id: '',
  locale: navigator.language || 'en-US',
  oidc: undefined as unknown as OidcSettings,
  api: undefined as unknown as ClubMedApiSettings,
  content: defaultContent,
  callbackUrl: '',
});
