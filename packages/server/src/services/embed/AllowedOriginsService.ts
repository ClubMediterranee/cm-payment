import { Constant, Inject, logger, Service } from '@tsed/di';

import { AllowedOriginsRepository } from './AllowedOriginsRepository.js';
import { normalizeOrigin, parseOriginList } from './origins.js';

/**
 * Host origins allowed to embed the CAPS form (`@clubmed/caps/webcomponent`).
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

  async getAllowedOrigins(): Promise<string[]> {
    return [
      ...new Set([
        ...parseOriginList(this.envAllowedOrigins),
        ...(await this.getDirectusOrigins()),
      ]),
    ];
  }

  async isAllowed(origin: string | undefined): Promise<boolean> {
    const normalized = normalizeOrigin(origin);

    if (!normalized) {
      return false;
    }

    return (await this.getAllowedOrigins()).includes(normalized);
  }

  protected async getDirectusOrigins(): Promise<string[]> {
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
