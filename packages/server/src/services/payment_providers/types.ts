import {
  PaymentProvider1,
  TimePaymentConditionModel,
} from '../../infra/api/__generated__/index.schemas.js';
import { OidcIssuerTypes } from '../payment_config/types.js';
import { StayType } from '../stay/types.js';

export interface GetPaymentProvidersParams {
  type: StayType;
  id: string;
  locale: string;
  issuerType: OidcIssuerTypes;
  customerId?: string;
}

export type PaymentProviderDisplayType = 'hosted_field' | 'iframe' | 'redirect';

export interface ProviderConfiguration {
  display_type: PaymentProviderDisplayType;
  settings: Record<string, unknown>;
}

export interface ProviderConfigMap {
  [providerId: string]: ProviderConfiguration & Record<string, unknown>;
}

export interface EnrichedPaymentProvider extends PaymentProvider1 {
  configuration: ProviderConfiguration;
  payment_conditions: Record<string, TimePaymentConditionModel[]>;
}

export interface PaymentProvidersResponse {
  payment_providers: EnrichedPaymentProvider[];
  buy_now_pay_later_providers: EnrichedPaymentProvider[];
}
