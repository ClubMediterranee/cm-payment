import { PspProviders } from '@clubmed/payment-sdk/types/PspProviders.js';
import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/SDKOptions.js';
import { TOKENS } from '@clubmed/payment-sdk/types/Tokens.js';
import type { IconicNames } from '@clubmed/trident-icons';

export const GLOBAL_SDK_SETTINGS = Object.freeze({
  iframeProviders: [PspProviders.EIXOPAY],
  serverValidationProviders: [PspProviders.EIXOPAY],
  withContactMethodProviders: [PspProviders.EIXOPAY],
  contactChoices: [
    {
      id: '6',
      name: 'email',
      label: 'Email',
      type: 'email',
      icon: 'Letter' as IconicNames,
    },
    {
      id: '8',
      name: 'mobile_phone',
      label: 'Téléphone',
      type: 'phone',
      icon: 'Phone' as IconicNames,
    },
  ],
  components: {
    [OidcIssuerTypes.GM]: [
      TOKENS.PaymentSchedule,
      TOKENS.Cgv,
      TOKENS.PaymentProviders,
      TOKENS.IframeProvider,
    ],
    [OidcIssuerTypes.GO]: [
      TOKENS.PaymentSchedule,
      TOKENS.Cgv,
      TOKENS.PaymentProviders,
      TOKENS.IframeProvider,
    ],
    [OidcIssuerTypes.PARTNERS]: [],
  } as const as Record<OidcIssuerTypes, symbol[]>,
});
