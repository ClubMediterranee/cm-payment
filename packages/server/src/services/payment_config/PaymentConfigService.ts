import { Inject, Service } from '@tsed/di';

import { GLOBAL_LOCALE, PUBLISHED_STATUS } from '../../infra/directus/constants.js';
import { DirectusClient } from '../../infra/directus/DirectusClient.js';
import type { ConfigValue, DirectusProvider } from '../../infra/directus/types.js';
import type { ProviderConfigMap } from '../payment_providers/types.js';
import { PaymentConfig } from './models.js';
import { CONFIG_MATCH_RULES, findByRules, PROVIDER_MATCH_RULES } from './resolvers.js';
import { OidcIssuerTypes } from './types.js';

@Service()
export class PaymentConfigService {
  @Inject()
  protected directusClient!: DirectusClient;

  async getPaymentConfig({
    issuerType,
    locale,
  }: {
    issuerType: OidcIssuerTypes;
    locale: string;
  }): Promise<PaymentConfig> {
    const configurations = await this.directusClient.getConfigurations();

    return configurations.reduce<{
      feature_flips: Record<string, boolean>;
      settings: Record<string, ConfigValue>;
    }>(
      (result, config) => {
        const override = findByRules(config.overrides, CONFIG_MATCH_RULES, {
          locale,
          issuer: issuerType,
        });
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

  async getPaymentProvidersConfig({ locale }: { locale: string }): Promise<ProviderConfigMap> {
    const providers = await this.directusClient.getProviders();

    return providers
      .filter((provider) => this.isProviderActive(provider, locale))
      .reduce<ProviderConfigMap>((config, provider) => {
        config[provider.id] = this.buildProviderConfig(provider, locale);
        return config;
      }, {});
  }

  private isProviderActive(providerConfig: DirectusProvider, locale: string): boolean {
    const settings = findByRules(providerConfig.settings, PROVIDER_MATCH_RULES, { locale });
    return settings?.status === PUBLISHED_STATUS;
  }

  private buildProviderConfig(
    providerConfig: DirectusProvider,
    locale: string,
  ): ProviderConfigMap[string] {
    const global = providerConfig.settings.find((s) => s.locale === GLOBAL_LOCALE);
    const local = providerConfig.settings.find((s) => s.locale === locale);

    const settings = [...(global?.settings || []), ...(local?.settings || [])].reduce(
      (acc, setting) => ({ ...acc, [setting.key]: setting.value }),
      {},
    );

    const excludedKeys = ['locale', 'status', 'settings'];
    const validationFields = Object.fromEntries(
      Object.entries({ ...global, ...local }).filter(([key]) => !excludedKeys.includes(key)),
    );

    return {
      ...validationFields,
      settings,
      display_type: providerConfig.default_display_type,
    };
  }
}
