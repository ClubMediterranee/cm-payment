import { OidcIssuerTypes } from './types/CapsSettings';
import { PaymentProviderDisplayType } from './types/PaymentConfig';
import { PspProviders } from './types/PspProviders';
import { TOKENS } from './types/Tokens';

export const GLOBAL_CAPS_SETTINGS = Object.freeze({
  serverValidationProviders: [PspProviders.EVOXPAY],
  thirdPartyIframeProviders: [PspProviders.MUPLIFT],
  providersDisplayMode: {
    [PspProviders.HIPAY]: 'hosted_field',
    [PspProviders.EPAYGATE]: 'iframe',
    [PspProviders.EGLOBALCOLLECT]: 'iframe',
    [PspProviders.MCYBERSOURCE]: 'hosted_field',
    [PspProviders.MUPLIFT]: 'iframe',
    [PspProviders.EHIPAYBNPL]: 'redirect',
  } as Record<PspProviders, PaymentProviderDisplayType>,
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
      TOKENS.PaymentWidget,
      TOKENS.SubmitButton,
    ],
    [OidcIssuerTypes.GO]: [TOKENS.PaymentSchedule, TOKENS.Cgv, TOKENS.PaymentProviders],
    [OidcIssuerTypes.PARTNERS]: [],
  } as const as Record<OidcIssuerTypes, symbol[]>,
});
