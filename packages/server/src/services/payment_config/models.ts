import {
  AdditionalProperties,
  CollectionOf,
  Enum,
  Nullable,
  Property,
  Required,
} from '@tsed/schema';

import type { CapsProvider } from '../../infra/directus/__generated__/schema.js';

export class FeatureFlipsConfig {
  @Property()
  is_paypal_button_enabled?: boolean;

  @Property()
  is_donation_enabled?: boolean;
}

@AdditionalProperties(true)
export class PaymentSettings {
  @Property()
  @Nullable(Number)
  days_before_trip_to_allow_free_deposit?: number | null;
}

export class PaymentConfig {
  @Property()
  feature_flips!: FeatureFlipsConfig;

  @Property()
  settings!: PaymentSettings;
}

export class ConfigurationOverrideModel {
  @Required()
  @Nullable(String)
  locale!: string | null;

  @Property()
  @Enum('GM', 'GO', 'PARTNERS')
  issuer?: 'GM' | 'GO' | 'PARTNERS';

  @Property()
  value!: unknown;
}

export class ConfigurationModel {
  @Required()
  key!: string;

  @Required()
  @Enum('string', 'number', 'boolean')
  type!: 'string' | 'number' | 'boolean';

  @Property()
  value!: unknown;

  @CollectionOf(ConfigurationOverrideModel)
  overrides!: ConfigurationOverrideModel[];
}

export class ProviderSettingModel {
  @Required()
  key!: string;

  @Property()
  value!: unknown;
}

export class ProviderVariantModel {
  @Required()
  @Nullable(String)
  locale!: string | null;

  @Required()
  active!: boolean;

  @CollectionOf(ProviderSettingModel)
  settings!: ProviderSettingModel[];

  @Property()
  validation!: Record<string, unknown>;
}

export class ProviderModel {
  @Required()
  id!: string;

  @Required()
  @Enum('hosted_field', 'iframe', 'redirect', 'custom')
  default_display_type!: CapsProvider['default_display_type'];

  @Property()
  @Nullable(String)
  @Enum('status', 'notify')
  confirmation_strategy?: 'status' | 'notify' | null;

  @CollectionOf(ProviderVariantModel)
  variants!: ProviderVariantModel[];
}
