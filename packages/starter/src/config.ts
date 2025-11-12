import { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings.js';

export const AppSettings = {
  paymentPageUrl:
    import.meta.env.VITE_PAYMENT_PAGE_URL === '/'
      ? window.location.origin
      : import.meta.env.VITE_PAYMENT_PAGE_URL,
  oidc: [
    {
      label: OidcIssuerTypes.GM,
      value: OidcIssuerTypes.GM,
    },
    {
      label: OidcIssuerTypes.GO,
      value: OidcIssuerTypes.GO,
    },
    {
      label: OidcIssuerTypes.PARTNERS,
      value: OidcIssuerTypes.PARTNERS,
    },
  ],
  locales: [
    { label: 'fr-FR', value: 'fr-FR' },
    { label: 'en-US', value: 'en-US' },
    { label: 'en-GB', value: 'en-GB' },
  ],
};
