import { OidcIssuerTypes } from './types/CapsSettings';
import { PspProviders } from './types/PspProviders';
import { TOKENS } from './types/Tokens';

export const GLOBAL_CAPS_SETTINGS = Object.freeze({
  iframeProviders: [PspProviders.EIXOPAY],
  serverValidationProviders: [PspProviders.EVOXPAY],
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
