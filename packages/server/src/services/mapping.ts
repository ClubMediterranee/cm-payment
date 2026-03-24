import { FeatureFlipsConfig } from '../types/PaymentConfig.js';

export const CMS_PREFIXES = {
  FEATURE_FLIPPING: 'featureFlipping.',
  OVERRIDE: 'override.',
  SELLER: 'seller.',
} as const;

export const FEATURE_FLIPS_MAPPING: Record<string, keyof FeatureFlipsConfig> = {
  'booking.banking.enableFreeDeposit': 'isFreeDepositEnabled',
};

export const SETTINGS_MAPPING = {
  daysBeforeTripToAllowFreeDeposit: {
    gm: 'booking.banking.freeDepositDeadline',
    seller: 'booking.seller.banking.freeDepositDeadline',
  },
};

export const SETTINGS_VALUE_MAPPING = {
  '999': null,
};

export const PROVIDER_PSP_PREFIX = 'psp.';
