import { createContext } from 'react';

import { defaultContent } from '../content/default';
import { CapsSettings, ClubMedApiSettings, OidcSettings } from '../types/CapsSettings';

const locale = navigator.language || 'en-US';
const [language, country] = locale.split('-');

export const CapsConfigContext = createContext<CapsSettings>({
  type: '' as CapsSettings['type'],
  id: '',
  locale,
  country,
  language,
  oidc: undefined as unknown as OidcSettings,
  api: undefined as unknown as ClubMedApiSettings,
  content: defaultContent,
  callbackUrl: '',
});
