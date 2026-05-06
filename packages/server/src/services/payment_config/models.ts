import { AdditionalProperties, Property } from '@tsed/schema';

export type PaymentProviderDisplayType = 'hosted_field' | 'iframe' | 'redirect';

export class CommonProviderSettings {
  @Property()
  max_amount?: string | null;

  @Property()
  min_days_before_departure?: string | null;
}

export class PaymentProviderConfig {
  @Property()
  is_active!: boolean;

  @Property()
  display_type?: PaymentProviderDisplayType;

  @Property()
  settings!: Record<string, unknown>;
}

export class FeatureFlipsConfig {
  @Property()
  is_free_deposit_enabled?: boolean;

  @Property()
  is_paypal_button_enabled?: boolean;
}

export class PaymentSettings {
  @Property()
  days_before_trip_to_allow_free_deposit!: number;
}

export class PaymentConfig {
  @Property()
  feature_flips!: FeatureFlipsConfig;

  @Property()
  settings!: PaymentSettings;
}

export class PaymentProvidersConfig {
  @Property()
  @AdditionalProperties(PaymentProviderConfig)
  providers!: Record<string, PaymentProviderConfig>;
}
