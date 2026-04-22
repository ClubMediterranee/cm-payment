import { Content } from './Content';

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
  apiKey: string;
};

export type CapsSettings = {
  paymentGatewayUrl: string;
  locale: string;
  country: string;
  language: string;
  id: string;
  customerId?: string;
  callbackUrl: string;
  callbackUrlSeller?: string;
  api: ClubMedApiSettings;
  oidc: OidcSettings;
  content: Content;
  type: 'proposal' | 'booking';
  /**
   * @deprecated LEGACY - This is a temporary workaround to inject CMS URL from the host application.
   * This will be removed in a future version when the SDK will have its own internal URL
   * to fetch payment configuration content.
   * @warning This parameter will be removed soon. Do not rely on it for long-term usage.
   */
  cmsUrl?: string;
};
