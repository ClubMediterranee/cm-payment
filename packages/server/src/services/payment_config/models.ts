import { AdditionalProperties, Enum, Nullable, Property } from '@tsed/schema';

import { CAPS_THEMES, type CapsTheme } from './types.js';

export class FeatureFlipsConfig {
  @Property()
  is_paypal_button_enabled?: boolean;

  @Property()
  is_donation_enabled?: boolean;

  @Property()
  is_comments_enabled?: boolean;
}

@AdditionalProperties(true)
export class PaymentSettings {
  @Property()
  @Nullable(Number)
  days_before_trip_to_allow_free_deposit?: number | null;

  @Property()
  @Enum(...CAPS_THEMES)
  theme?: CapsTheme;
}

export class PaymentConfig {
  @Property()
  feature_flips!: FeatureFlipsConfig;

  @Property()
  settings!: PaymentSettings;
}
