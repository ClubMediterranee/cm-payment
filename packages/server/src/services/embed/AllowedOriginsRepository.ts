import { Inject, Injectable } from '@tsed/di';
import { UseCache } from '@tsed/platform-cache';

import { DirectusClient } from '../../infra/directus/DirectusClient.js';
import { normalizeOrigin } from './origins.js';

@Injectable()
export class AllowedOriginsRepository {
  @Inject()
  protected directusClient!: DirectusClient;

  /**
   * Published entries of the Directus collection `caps_allowed_origins` (CMAB-4432).
   * Cached 5 minutes and refreshed in the background during its last minute: while Directus is
   * unavailable, the previous list is kept until it expires. Values are in milliseconds:
   * `@tsed/platform-cache` passes them as is to cache-manager 5 (tsedio/tsed#3547).
   */
  @UseCache({ ttl: 5 * 60_000, refreshThreshold: 4 * 60_000 })
  async getAllowedOrigins(): Promise<string[]> {
    const items = await this.directusClient.getAllowedOrigins();

    return items.flatMap(({ origin }) => {
      const normalized = normalizeOrigin(origin);

      return normalized ? [normalized] : [];
    });
  }
}
