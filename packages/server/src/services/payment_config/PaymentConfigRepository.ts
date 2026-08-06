import { Inject, Injectable } from '@tsed/di';

import { GLOBAL_LOCALE } from '../../infra/directus/constants.js';
import { DirectusClient } from '../../infra/directus/DirectusClient.js';

type RawProvider = Awaited<ReturnType<DirectusClient['getProviders']>>[number];
type RawVariant = NonNullable<RawProvider['settings']>[number];

@Injectable()
export class PaymentConfigRepository {
  @Inject()
  protected directusClient!: DirectusClient;

  async getConfigurations() {
    const configurations = await this.directusClient.getConfigurations();
    return configurations.map(({ overrides, ...configuration }) => ({
      ...configuration,
      overrides: (overrides ?? []).map(({ locale, ...override }) => ({
        ...override,
        locale: locale === GLOBAL_LOCALE ? null : locale,
      })),
    }));
  }

  async getProviders() {
    const providers = await this.directusClient.getProviders();
    return providers.map(({ settings, ...provider }) => ({
      ...provider,
      variants: (settings ?? []).map((variant) => this.toVariant(variant)),
    }));
  }

  private toVariant(raw: RawVariant) {
    const { locale, settings, allowed_actions, ...validation } = raw;
    return {
      locale: locale === GLOBAL_LOCALE ? null : locale,
      allowed_actions: allowed_actions ?? [],
      settings: settings ?? [],
      validation,
    };
  }
}
