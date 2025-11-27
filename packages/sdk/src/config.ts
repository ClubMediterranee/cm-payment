import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings.js';
import { PspProviders } from '@clubmed/payment-sdk/types/PspProviders.js';
import { TOKENS } from '@clubmed/payment-sdk/types/Tokens.js';

export const GLOBAL_CAPS_SETTINGS = Object.freeze({
  iframeProviders: [PspProviders.EIXOPAY],
  serverValidationProviders: [PspProviders.EIXOPAY],
  withContactMethodProviders: [PspProviders.EVOXPAY],
  templateIds: {
    email: '6',
    mobilePhone: '4',
    call: '1',
  } as const,
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
