import {
  PaymentProvider1,
  TimePaymentConditionModel,
} from '../../infra/api/__generated__/index.js';
import type { CapsProvider } from '../../infra/directus/__generated__/schema.js';

export const MANUAL_CONNECTION_TYPE = 'Manual';

export interface ProviderConfigMap {
  [providerId: string]: {
    display_type: CapsProvider['default_display_type'];
    confirmation_strategy: NonNullable<CapsProvider['confirmation_strategy']>;
    settings: Record<string, unknown>;
  } & Record<string, unknown>;
}

export interface EnrichedPaymentProvider extends PaymentProvider1 {
  configuration: ProviderConfigMap[string];
  payment_conditions: Record<string, TimePaymentConditionModel[]>;
}

export interface PaymentProvidersResponse {
  payment_providers: EnrichedPaymentProvider[];
  buy_now_pay_later_providers: EnrichedPaymentProvider[];
}
