import { FeatureFlipsConfig } from '../../../types/PaymentConfig';

export const CMS_PREFIXES = {
  FEATURE_FLIPPING: 'featureFlipping.',
  OVERRIDE: 'override.',
  SELLER: 'seller.',
} as const;

export const FEATURE_FLIPS_MAPPING: Record<string, keyof FeatureFlipsConfig> = {
  'booking.banking.enableFreeDeposit': 'isFreeDepositEnabled',
};

export const PROVIDER_PSP_PREFIX = 'psp.';
