export type PaymentProviderDisplayType = 'hosted_field' | 'iframe' | 'redirect' | 'custom';

export type CommonProviderSettings = {
  max_amount?: string | null;
  min_days_before_departure?: string | null;
};

export interface PaymentProviderConfig {
  display_type?: PaymentProviderDisplayType;
  category_payment_method?: string;
  billing_address_form?: boolean;
  settings: CommonProviderSettings & Record<string, unknown>;
}

export interface FeatureFlipsConfig {
  isFreeDepositEnabled?: boolean;
  isPaypalButtonEnabled?: boolean;
}

export interface PaymentSettings {
  daysBeforeTripToAllowFreeDeposit: number;
}

export interface PaymentConfig {
  providers: Record<string, PaymentProviderConfig>;
  featureFlip: FeatureFlipsConfig;
  settings: PaymentSettings;
}
