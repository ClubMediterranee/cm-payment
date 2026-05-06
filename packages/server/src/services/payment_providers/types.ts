import { OidcIssuerTypes } from '../payment_config/types.js';
import { StayType } from '../stay/types.js';

export interface GetPaymentProvidersParams {
  type: StayType;
  id: string;
  locale: string;
  issuerType: OidcIssuerTypes;
  customerId?: string;
}

export interface ProviderConfigMap {
  [providerId: string]: {
    is_active: boolean;
    display_type?: 'hosted_field' | 'iframe' | 'redirect';
    settings?: Record<string, unknown>;
  };
}
