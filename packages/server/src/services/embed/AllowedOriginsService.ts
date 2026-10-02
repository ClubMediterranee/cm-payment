import { Constant, Inject, logger, Service } from '@tsed/di';

import { AllowedOriginsRepository } from './AllowedOriginsRepository.js';
import type { AllowedOrigin, EmbedMode } from './models.js';
import { groupOriginsByMode, normalizeOrigin, parseOriginList } from './origins.js';

/**
 * Host origins allowed to embed CAPS (webcomponent and iframe modes).
 *
 * Sources: published entries of the Directus collection `caps_allowed_origins` (CMAB-4432),
 * merged with the `CAPS_ALLOWED_ORIGINS` environment variable (bootstrap, local dev, fallback).
 */
@Service()
export class AllowedOriginsService {
  @Inject()
  protected allowedOriginsRepository!: AllowedOriginsRepository;

  @Constant('CAPS_ALLOWED_ORIGINS', '')
  protected envAllowedOrigins!: string;

  async getAllowedOrigins(): Promise<Record<EmbedMode, string[]>> {
    return groupOriginsByMode([
      ...parseOriginList(this.envAllowedOrigins),
      ...(await this.getDirectusOrigins()),
    ]);
  }

  async isAllowed(origin: string | undefined, mode: EmbedMode): Promise<boolean> {
    const normalized = normalizeOrigin(origin);

    if (!normalized) {
      return false;
    }

    return (await this.getAllowedOrigins())[mode].includes(normalized);
  }

  protected async getDirectusOrigins(): Promise<AllowedOrigin[]> {
    try {
      return await this.allowedOriginsRepository.getAllowedOrigins();
    } catch (error) {
      logger().warn({
        event: 'EMBED_ALLOWED_ORIGINS_UNAVAILABLE',
        message:
          'Unable to load caps_allowed_origins from Directus, using CAPS_ALLOWED_ORIGINS only',
        error: (error as Error)?.message,
      });

      return [];
    }
  }
}
