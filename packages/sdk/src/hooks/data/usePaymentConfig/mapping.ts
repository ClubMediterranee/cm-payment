import { FeatureFlipsConfig } from '../../../types/PaymentConfig';

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

export const PROVIDER_SETTINGS_MAPPING = {
  EHIPAYBNPL: {
    payment_mode: 'booking.banking.paymentSchedule.bnpl.oneyInstallmentCount',
    merchant_id: '8a3ddbfcd79c44f09882c6e39af07fca',
    script_url: 'https://assets-staging.oney.io/build/loader.min.js',
    max_amount: 'booking.banking.paymentSchedule.bnpl.maxAmount',
    min_days_before_departure: 45,
  },
  MUPLIFT: {
    api_key: 'MtMtysEvV832jJUMYZed642uP5IbX6bo8NcGPe7X',
    code: 'UP-75709538-99',
  },
  MHIPAY: {
    script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
    username: '94675627.stage-secure-gateway.hipay-tpp.com',
    password: 'Test_jTQeMVl7R8Om7LTFGZwJV0Q5',
    environment: 'stage',
  },
} as const;

export const PROVIDER_PSP_PREFIX = 'psp.';
