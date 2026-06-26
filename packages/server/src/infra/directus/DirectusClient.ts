import {
  createDirectus,
  type DirectusClient as DirectusSDKClient,
  readItems,
  rest,
  type RestClient,
  staticToken,
} from '@directus/sdk';
import { Constant, Injectable } from '@tsed/di';

import type { Schema } from './__generated__/schema.js';

@Injectable()
export class DirectusClient {
  @Constant('DIRECTUS_URL', 'https://staging.cms.api.clubmed')
  protected directusUrl!: string;

  @Constant('DIRECTUS_API_TOKEN', '')
  protected directusApiToken!: string;

  private client!: DirectusSDKClient<Schema> & RestClient<Schema>;

  $onInit() {
    this.client = createDirectus<Schema>(this.directusUrl)
      .with(staticToken(this.directusApiToken))
      .with(rest());
  }

  getConfigurations() {
    return this.client.request(
      readItems('caps_configurations', {
        fields: ['key', 'type', 'value', 'overrides'],
      }),
    );
  }

  getProviders() {
    return this.client.request(
      readItems('caps_providers', {
        fields: [
          'id',
          'default_display_type',
          'confirmation_strategy',
          {
            settings: [
              'locale',
              'status',
              'display_type',
              'requires_token',
              'requires_expiry_date',
              'requires_contact_choice',
              'settings',
            ],
          },
        ],
      }),
    );
  }
}
