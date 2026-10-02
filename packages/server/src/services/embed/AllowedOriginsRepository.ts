import { Inject, Injectable } from '@tsed/di';
import { UseCache } from '@tsed/platform-cache';

import { DirectusClient } from '../../infra/directus/DirectusClient.js';
import type { AllowedOrigin, EmbedMode } from './models.js';
import { EMBED_MODES, normalizeOrigin } from './origins.js';

@Injectable()
export class AllowedOriginsRepository {
  @Inject()
  protected directusClient!: DirectusClient;

  /**
   * Published entries of the Directus collection `caps_allowed_origins` (CMAB-4432).
   * Cached 5 minutes and refreshed in the background after 1 minute: while Directus is unavailable,
   * the previous list is kept until it expires.
   */
  @UseCache({ ttl: 300, refreshThreshold: 240 })
  async getAllowedOrigins(): Promise<AllowedOrigin[]> {
    const items = await this.directusClient.getAllowedOrigins();

    return items.flatMap(({ origin, modes }) => {
      const normalized = normalizeOrigin(origin);
      const validModes = (modes || []).filter((mode): mode is EmbedMode =>
        EMBED_MODES.includes(mode as EmbedMode),
      );

      return normalized ? [{ origin: normalized, modes: validModes }] : [];
    });
  }
}
