export type PaymentProviderDisplayType = 'hosted_field' | 'iframe' | 'redirect';

export interface PaymentProviderConfig {
  is_active: boolean;
  display_type?: PaymentProviderDisplayType;
  category_payment_method?: string;
  billing_address_form?: boolean;
  settings?: Record<string, unknown>;
}

export interface FeatureFlipsConfig {
  isFreeDepositEnabled?: boolean;
}

export interface PaymentSettings {
  freeDepositDeadline?: number;
}

export interface PaymentConfig {
  providers: Record<string, PaymentProviderConfig>;
  featureFlip: FeatureFlipsConfig;
  settings: PaymentSettings;
}
