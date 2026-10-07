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
  url: string;
  apiKey: string;
};

export type CapsSettings = {
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
   * Overrides top-level navigations (PSP redirection, confirmation). Used by the webcomponent embed.
   * Defaults to `window.location` / form submission.
   */
  onNavigate?: (request: {
    url: string;
    method?: 'GET' | 'POST';
    fields?: Record<string, string>;
  }) => void;
};
