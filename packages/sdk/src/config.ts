import { OidcIssuerTypes } from './types/CapsSettings';
import { PspProviders } from './types/PspProviders';
import { TOKENS } from './types/Tokens';

export const GLOBAL_CAPS_SETTINGS = Object.freeze({
  thirdPartyIframeProviders: [PspProviders.MUPLIFT],
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
      TOKENS.BillingAddress,
      TOKENS.PaymentWidget,
      TOKENS.CardInstallments,
      TOKENS.SubmitButton,
      TOKENS.Donation,
    ],
    [OidcIssuerTypes.GO]: [
      TOKENS.PaymentSchedule,
      TOKENS.Cgv,
      TOKENS.ContactChoice,
      TOKENS.PaymentProviders,
      TOKENS.BillingAddress,
      TOKENS.CardInstallments,
      TOKENS.SubmitButton,
      TOKENS.Donation,
    ],
    [OidcIssuerTypes.PARTNERS]: [
      TOKENS.PaymentSchedule,
      TOKENS.Cgv,
      TOKENS.ContactChoice,
      TOKENS.PaymentProviders,
      TOKENS.BillingAddress,
      TOKENS.CardInstallments,
      TOKENS.SubmitButton,
      TOKENS.Donation,
    ],
  } as const as Record<OidcIssuerTypes, symbol[]>,
});
