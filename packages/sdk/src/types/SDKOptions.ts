import { Action } from '@clubmed/payment-sdk/__generated__/index.js';

export enum OidcIssuerTypes {
  GM = 'GM',
  GO = 'GO',
  PARTNERS = 'PARTNERS',
}

export type OidcSettings = {
  /**
   * The type of issuer, which can be "GM" (Club Med), "GO" (CxO), or "PARTNER" (a partner company).
   */
  issuerType: OidcIssuerTypes;
  /**
   * The access token used for authentication.
   */
  accessToken: string;
};

export type ClubMedApiSettings = {
  url: string;
  apiKey: string;
};

export type SDKOptions = {
  /**
   * current public url
   */
  url: string;
  /**
   * The locale for the SDK, such as "en-US" or "fr-FR".
   */
  locale: string;
  /**
   * The action to be performed, such as payment or reservation.
   */
  action: Action;
  /**
   * The proposalId
   */
  proposalId?: string;
  /**
   * The bookingId
   */
  bookingId?: string;
  /**
   * The customerID associated with the booking or proposal.
   */
  customerId: string;
  /**
   * The URL to redirect to after the payment process is complete.
   */
  callbackUrl?: string;
  /**
   * API settings for Club Med.
   */
  api: ClubMedApiSettings;
  /**
   * OIDC settings for authentication.
   */
  oidc: OidcSettings;
};
