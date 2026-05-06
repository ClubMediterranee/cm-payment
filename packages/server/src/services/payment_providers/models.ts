import {
  PaymentProvider1,
  TimePaymentConditionModel,
} from '../../infra/api/__generated__/index.schemas.js';

export type PaymentProviderDisplayType = 'hosted_field' | 'iframe' | 'redirect';

export interface ProviderValidation {
  requires_token: boolean;
  requires_expiry_date: boolean;
}

export interface ProviderConfiguration {
  display_type: PaymentProviderDisplayType;
  settings: Record<string, unknown>;
  validation: ProviderValidation;
}

export interface EnrichedPaymentProvider extends PaymentProvider1 {
  configuration: ProviderConfiguration;
  payment_conditions: Record<string, TimePaymentConditionModel[]>;
}

export interface PaymentProvidersResponse {
  payment_providers: EnrichedPaymentProvider[];
  buy_now_pay_later_providers: EnrichedPaymentProvider[];
}
