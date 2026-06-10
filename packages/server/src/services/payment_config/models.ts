import {
  AdditionalProperties,
  CollectionOf,
  Enum,
  Nullable,
  Property,
  Required,
} from '@tsed/schema';

import type { PaymentProviderDisplayType } from '../payment_providers/types.js';

@AdditionalProperties(true)
export class FeatureFlipsConfig {}

@AdditionalProperties(true)
export class PaymentSettings {}

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
  default_display_type!: PaymentProviderDisplayType;

  @Property()
  @Nullable(String)
  @Enum('status', 'notify')
  confirmation_strategy?: 'status' | 'notify' | null;

  @CollectionOf(ProviderVariantModel)
  variants!: ProviderVariantModel[];
}
