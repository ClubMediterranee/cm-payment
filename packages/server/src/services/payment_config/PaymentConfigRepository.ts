import { Inject, Injectable } from '@tsed/di';
import { deserialize } from '@tsed/json-mapper';

import { GLOBAL_LOCALE, PUBLISHED_STATUS } from '../../infra/directus/constants.js';
import { DirectusClient } from '../../infra/directus/DirectusClient.js';
import { ConfigurationModel, ProviderModel } from './models.js';

type RawProvider = Awaited<ReturnType<DirectusClient['getProviders']>>[number];
type RawVariant = NonNullable<RawProvider['settings']>[number];

@Injectable()
export class PaymentConfigRepository {
  @Inject()
  protected directusClient!: DirectusClient;

  async getConfigurations() {
    const configurations = await this.directusClient.getConfigurations();
    const plain = configurations.map(({ overrides, ...configuration }) => ({
      ...configuration,
      overrides: (overrides ?? []).map(({ locale, ...override }) => ({
        ...override,
        locale: locale === GLOBAL_LOCALE ? null : locale,
      })),
    }));
    return deserialize<ConfigurationModel[]>(plain, {
      type: ConfigurationModel,
      collectionType: Array,
    });
  }

  async getProviders() {
    const providers = await this.directusClient.getProviders();
    const plain = providers.map(({ settings, ...provider }) => ({
      ...provider,
      variants: (settings ?? []).map((variant) => this.toVariant(variant)),
    }));
    return deserialize<ProviderModel[]>(plain, {
      type: ProviderModel,
      collectionType: Array,
    });
  }

  private toVariant(raw: RawVariant) {
    const { locale, status, settings, ...validation } = raw;
    return {
      locale: locale === GLOBAL_LOCALE ? null : locale,
      active: status === PUBLISHED_STATUS,
      settings: settings ?? [],
      validation,
    };
  }
}
