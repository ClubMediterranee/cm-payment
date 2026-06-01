import { AdditionalProperties, Property } from '@tsed/schema';

export type PaymentProviderDisplayType = 'hosted_field' | 'iframe' | 'redirect';

export class PaymentProviderConfig {
  @Property()
  display_type?: PaymentProviderDisplayType;

  @Property()
  settings!: Record<string, unknown>;
}

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

export class PaymentProvidersConfig {
  @Property()
  @AdditionalProperties(PaymentProviderConfig)
  providers!: Record<string, PaymentProviderConfig>;
}
