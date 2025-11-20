import { FeatureFlipsConfig } from '../../../types/PaymentConfig';

export const FEATURE_FLIPS_MAPPING: Record<string, keyof FeatureFlipsConfig> = {
  'booking.banking.enableFreeDeposit': 'isFreeDepositEnabled',
};
