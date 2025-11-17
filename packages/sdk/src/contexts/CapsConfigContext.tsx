import type {
  CapsSettings,
  ClubMedApiSettings,
  OidcSettings,
} from '@clubmed/payment-sdk/types/CapsSettings';
import { createContext } from 'react';

import { defaultContent } from '../content/default';

export const CapsConfigContext = createContext<CapsSettings>({
  type: '' as CapsSettings['type'],
  url: '',
  id: '',
  locale: navigator.language || 'en-US',
  oidc: undefined as unknown as OidcSettings,
  api: undefined as unknown as ClubMedApiSettings,
  content: defaultContent,
  callbackUrl: '',
});
