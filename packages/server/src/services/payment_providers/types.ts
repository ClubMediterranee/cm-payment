import {
  PaymentProvider1,
  TimePaymentConditionModel,
} from '../../infra/api/__generated__/index.schemas.js';
import type { CapsProvider } from '../../infra/directus/__generated__/schema.js';
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

export interface ProviderConfigMap {
  [providerId: string]: {
    display_type: PaymentProviderDisplayType;
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
