import { Action } from '../infra/api/__generated__/index.js';
import { OidcIssuerTypes } from '../services/payment_config/types.js';

export type ResourceType = 'booking' | 'proposal';

export interface ResourceRef {
  type: ResourceType;
  id: string;
  customerId?: string;
  locale: string;
  issuerType: OidcIssuerTypes;
  action?: Action;
  userAgent?: string;
}
