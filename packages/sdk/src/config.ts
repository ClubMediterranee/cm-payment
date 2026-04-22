import { OidcIssuerTypes } from './types/CapsSettings';
import { PspProviders } from './types/PspProviders';
import { TOKENS } from './types/Tokens';

export const GLOBAL_CAPS_SETTINGS = Object.freeze({
  thirdPartyIframeProviders: [PspProviders.MUPLIFT],
  withContactMethodProviders: [PspProviders.EVOXPAY],
  templateIds: {
    email: '6',
    mobilePhone: '4',
    call: '1',
  } as const,
  donation: {
    presetAmounts: [5, 20, 50],
  } as const,
  components: {
    [OidcIssuerTypes.GM]: [
      TOKENS.PaymentSchedule,
      TOKENS.Cgv,
      TOKENS.PaymentProviders,
      TOKENS.PaymentWidget,
      TOKENS.SubmitButton,
    ],
    [OidcIssuerTypes.GO]: [TOKENS.PaymentSchedule, TOKENS.Cgv, TOKENS.PaymentProviders],
    [OidcIssuerTypes.PARTNERS]: [],
  } as const as Record<OidcIssuerTypes, symbol[]>,
});
