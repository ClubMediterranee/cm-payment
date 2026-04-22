import { FeatureFlipsConfig } from '../../../types/PaymentConfig';

export const CMS_PREFIXES = {
  FEATURE_FLIPPING: 'featureFlipping.',
  OVERRIDE: 'override.',
  SELLER: 'seller.',
} as const;

export const FEATURE_FLIPS_MAPPING: Record<string, keyof FeatureFlipsConfig> = {
  'booking.banking.enableFreeDeposit': 'isFreeDepositEnabled',
  'psp.paypal.enable_button': 'isPaypalButtonEnabled',
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
    display_type: 'redirect',
  },
  MUPLIFT: {
    api_key: 'MtMtysEvV832jJUMYZed642uP5IbX6bo8NcGPe7X',
    code: 'UP-75709538-99',
    display_type: 'iframe',
  },
  MHIPAY: {
    script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
    username: '94685941.stage-secure-gateway.hipay-tpp.com',
    password: 'Test_KDArvJ3iCVesjQj3XRriMkXs',
    environment: 'stage',
    display_type: 'hosted_field',
  },
  MHIPAYPP: {
    script_url: 'https://stage-libs.hipay.com/js/sdkjs.js',
    username: '94685941.stage-secure-gateway.hipay-tpp.com',
    password: 'Test_KDArvJ3iCVesjQj3XRriMkXs',
    environment: 'stage',
    display_type: 'redirect',
  },
  EIXOPAY: {
    display_type: 'redirect',
  },
  EVOXPAY: {
    display_type: 'redirect',
  },
  ENETPAY: {
    display_type: 'redirect',
  },
  EGLOBALCOLLECT: {
    display_type: 'iframe',
  },
  EPAYGATE: {
    display_type: 'iframe',
  },
  MCYBERSOURCE: {
    display_type: 'hosted_field',
  },
} as const;

export const PROVIDER_PSP_PREFIX = 'psp.';
