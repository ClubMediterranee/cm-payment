import { Action } from '../../infra/api/__generated__/index.schemas.js';
import { OidcIssuerTypes } from '../payment_config/types.js';

export type ActionResolverType = 'booking' | 'proposal';

export type ResolveActionParams = {
  type: ActionResolverType;
  id: string;
  customerId?: string;
  action?: Action;
  locale: string;
  issuerType: OidcIssuerTypes;
};
