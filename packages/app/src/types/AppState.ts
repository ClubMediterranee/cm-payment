import { Action, OidcIssuerTypes } from '@clubmed/caps';

export interface AppState {
  issuerType: OidcIssuerTypes;
  bookingId?: string;
  proposalId?: string;
  customerId: string;
  locale: string;
  action?: Action;
  callbackUrl: string;
  callbackUrlSeller?: string;
}
