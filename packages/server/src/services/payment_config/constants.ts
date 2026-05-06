import { FeatureFlipsConfig } from './models.js';

export const CMS_PREFIXES = {
  FEATURE_FLIPPING: 'featureFlipping.',
  OVERRIDE: 'override.',
  SELLER: 'seller.',
} as const;

export const FEATURE_FLIPS_MAPPING: Record<string, keyof FeatureFlipsConfig> = {
  'booking.banking.enableFreeDeposit': 'is_free_deposit_enabled',
  'psp.paypal.enable_button': 'is_paypal_button_enabled',
};

export const SETTINGS_MAPPING = {
  days_before_trip_to_allow_free_deposit: {
    gm: 'booking.banking.freeDepositDeadline',
    seller: 'booking.sellers.banking.freeDepositDeadline',
  },
};

export const SETTINGS_VALUE_MAPPING = {
  '999': null,
};

export const PROVIDER_DISPLAY_TYPE_MAPPING = {
  MUPLIFT: 'iframe',
  MHIPAY: 'hosted_field',
  EGLOBALCOLLECT: 'iframe',
  EPAYGATE: 'iframe',
  MCYBERSOURCE: 'hosted_field',
} as const;

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
    username: '94685941.stage-secure-gateway.hipay-tpp.com',
    password: 'Test_KDArvJ3iCVesjQj3XRriMkXs',
    environment: 'stage',
  },
  MHIPAYPP: {
    script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
    username: '94685941.stage-secure-gateway.hipay-tpp.com',
    password: 'Test_KDArvJ3iCVesjQj3XRriMkXs',
    environment: 'stage',
  },
} as const;

export const PROVIDER_PSP_PREFIX = 'psp.';
