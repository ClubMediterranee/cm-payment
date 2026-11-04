import {
  PaymentProvider1,
  TimePaymentConditionModel,
} from '../../infra/api/__generated__/index.js';
import type { PaymentConfigService } from '../payment_config/PaymentConfigService.js';

export const MANUAL_CONNECTION_TYPE = 'Manual';

type ProviderConfig = Awaited<
  ReturnType<PaymentConfigService['getPaymentProvidersConfig']>
>[string];

export interface EnrichedPaymentProvider extends PaymentProvider1 {
  configuration: ProviderConfig;
  payment_conditions: Record<string, TimePaymentConditionModel[]>;
}

export interface PaymentProvidersResponse {
  payment_providers: EnrichedPaymentProvider[];
  buy_now_pay_later_providers: EnrichedPaymentProvider[];
}
