import { Action } from '@clubmed/caps/types';
import type { OidcIssuerTypes } from '@clubmed/caps/types/CapsSettings.js';

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
