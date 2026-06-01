import {
  createDirectus,
  type DirectusClient as DirectusSDKClient,
  readItems,
  rest,
  type RestClient,
  staticToken,
} from '@directus/sdk';
import { Constant, Injectable } from '@tsed/di';

import {
  DIRECTUS_COLLECTIONS,
  DIRECTUS_CONFIGURATION_FIELDS,
  DIRECTUS_SYSTEM_FIELDS,
} from './constants.js';
import type { DirectusConfiguration, DirectusProvider } from './types.js';

@Injectable()
export class DirectusClient {
  @Constant('DIRECTUS_URL')
  protected directusUrl!: string;

  @Constant('DIRECTUS_API_TOKEN')
  protected directusApiToken!: string;

  private client!: DirectusSDKClient<any> & RestClient<any>;

  $onInit() {
    this.client = createDirectus(this.directusUrl)
      .with(staticToken(this.directusApiToken))
      .with(rest());
  }

  async getItems<T>(
    collection: string,
    query?: {
      filter?: Record<string, unknown>;
      sort?: string[];
      limit?: number;
      offset?: number;
      fields?: string[];
      deep?: Record<string, unknown>;
    },
  ): Promise<T[]> {
    try {
      const result = await this.client.request(readItems(collection, { ...query }));
      return result as T[];
    } catch (error) {
      throw new Error(`Failed to fetch items from collection "${collection}": ${error?.message}`);
    }
  }

  private cleanSystemFields(items: DirectusProvider[]): DirectusProvider[] {
    return items.map((item) => {
      if (item.settings && Array.isArray(item.settings)) {
        item.settings = item.settings.map((setting) => {
          const cleaned = { ...setting };
          DIRECTUS_SYSTEM_FIELDS.forEach((field) => {
            delete (cleaned as any)[field];
          });
          return cleaned;
        });
      }
      return item;
    });
  }

  async getConfigurations(): Promise<DirectusConfiguration[]> {
    return this.getItems<DirectusConfiguration>(DIRECTUS_COLLECTIONS.CONFIGURATIONS, {
      fields: [...DIRECTUS_CONFIGURATION_FIELDS],
    });
  }

  async getProviders(): Promise<DirectusProvider[]> {
    const providers = await this.getItems<DirectusProvider>(DIRECTUS_COLLECTIONS.PROVIDERS, {
      fields: ['*', 'settings.*'],
    });
    return this.cleanSystemFields(providers);
  }
}
