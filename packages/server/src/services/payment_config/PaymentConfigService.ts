import { Inject, Service } from '@tsed/di';

import type { ProviderConfigMap } from '../payment_providers/types.js';
import type { ProviderModel } from './models.js';
import { PaymentConfigRepository } from './PaymentConfigRepository.js';
import { configMatchRules, findByRules, providerMatchRules } from './resolvers.js';
import { OidcIssuerTypes, PaymentConfigSettings, PaymentFeatureFlips } from './types.js';

@Service()
export class PaymentConfigService {
  @Inject()
  protected paymentConfigRepository!: PaymentConfigRepository;

  async getPaymentConfig({
    issuerType,
    locale,
  }: {
    issuerType: OidcIssuerTypes;
    locale: string;
  }): Promise<{ feature_flips: PaymentFeatureFlips; settings: PaymentConfigSettings }> {
    const configurations = await this.paymentConfigRepository.getConfigurations();

    const feature_flips: PaymentFeatureFlips = {};
    const settings: PaymentConfigSettings = {};

    for (const config of configurations) {
      const override = findByRules(
        config.overrides,
        configMatchRules({ locale, issuer: issuerType }),
      );
      const value = override ? override.value : config.value;

      if (config.type === 'boolean') {
        (feature_flips as Record<string, boolean>)[config.key] = value as boolean;
      } else {
        (settings as Record<string, unknown>)[config.key] = value;
      }
    }

    return { feature_flips, settings };
  }

  async getPaymentProvidersConfig({ locale }: { locale: string }) {
    const providers = await this.paymentConfigRepository.getProviders();

    return providers
      .filter((provider) => this.isProviderActive(provider, locale))
      .reduce<ProviderConfigMap>((config, provider) => {
        config[provider.id] = this.buildProviderConfig(provider, locale);
        return config;
      }, {});
  }

  private isProviderActive(provider: ProviderModel, locale: string) {
    const variant = findByRules(provider.variants, providerMatchRules({ locale }));
    return !!variant?.active;
  }

  private buildProviderConfig(provider: ProviderModel, locale: string) {
    const global = provider.variants.find((v) => v.locale === null);
    const local = provider.variants.find((v) => v.locale === locale);

    const settings = [...(global?.settings || []), ...(local?.settings || [])].reduce(
      (acc, setting) => ({ ...acc, [setting.key]: setting.value }),
      {},
    );

    return {
      ...global?.validation,
      ...local?.validation,
      settings,
      display_type: provider.default_display_type,
    };
  }
}
