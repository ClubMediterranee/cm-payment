import {OidcIssuerTypes} from "@clubmed/payment-sdk/types/SDKOptions.js";

export const AppSettings = {
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
      value: OidcIssuerTypes.PARTNERS
    }
  ],
  locales: [
    { label: "fr-FR", value: "fr-FR" },
    { label: "en-US", value: "en-US" },
    { label: "en-GB", value: "en-GB" }
  ]
}