import type { OidcIssuerTypes } from '@clubmed/payment-sdk/types/SDKOptions.js';

export interface AppState {
  issuerType: OidcIssuerTypes;
  bookingId?: string | undefined;
  proposalId?: string | undefined;
  customerId: string;
  locale: string;
}
