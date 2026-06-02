import { Inject, Service } from '@tsed/di';

import type { ProviderConfigMap } from '../payment_providers/types.js';
import type { ProviderModel } from './models.js';
import { PaymentConfigRepository } from './PaymentConfigRepository.js';
import { configMatchRules, findByRules, providerMatchRules } from './resolvers.js';
import { OidcIssuerTypes } from './types.js';

@Service()
export class PaymentConfigService {
  @Inject()
  protected paymentConfigRepository!: PaymentConfigRepository;

  async getPaymentConfig({ issuerType, locale }: { issuerType: OidcIssuerTypes; locale: string }) {
    const configurations = await this.paymentConfigRepository.getConfigurations();

    return configurations.reduce<{
      feature_flips: Record<string, boolean>;
      settings: Record<string, unknown>;
    }>(
      (result, config) => {
        const override = findByRules(
          config.overrides,
          configMatchRules({ locale, issuer: issuerType }),
        );
        const value = override ? override.value : config.value;

        if (config.type === 'boolean') {
          result.feature_flips[config.key] = value as boolean;
        } else {
          result.settings[config.key] = value;
        }

        return result;
      },
      { feature_flips: {}, settings: {} },
    );
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
