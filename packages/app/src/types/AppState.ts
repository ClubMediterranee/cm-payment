import { Action } from '@clubmed/payment-sdk/__generated__';
import type { OidcIssuerTypes } from '@clubmed/payment-sdk/types/CapsSettings.js';

export interface AppState {
  issuerType: OidcIssuerTypes;
  bookingId?: string;
  proposalId?: string;
  customerId: string;
  locale: string;
  action?: Action;
  callbackUrl: string;
}
