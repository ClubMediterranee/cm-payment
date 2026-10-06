import { Constant, Inject, Service } from '@tsed/di';

import { OidcIssuerTypes } from '../payment_config/types.js';
import { AllowedOriginsService } from './AllowedOriginsService.js';
import { EMBED_PROTOCOL_VERSION, EmbedConfig, EmbedFlowType } from './models.js';

/**
 * Runtime configuration consumed by the embedded CAPS flow (webcomponent remote).
 */
@Service()
export class EmbedConfigService {
  @Inject()
  protected allowedOriginsService!: AllowedOriginsService;

  @Constant('BASE_URL', '')
  protected baseUrl!: string;

  @Constant('CAPS_API_KEY_GM_BE', '')
  protected gmApiKeyBe!: string;

  @Constant('CAPS_API_KEY_GM_CA', '')
  protected gmApiKeyCa!: string;

  @Constant('CAPS_API_KEY_GO', '')
  protected goApiKey!: string;

  @Constant('CAPS_API_KEY_PARTNERS', '')
  protected partnersApiKey!: string;

  async getConfig({
    issuerType,
    type,
    requestOrigin,
  }: {
    issuerType: OidcIssuerTypes;
    type: EmbedFlowType;
    requestOrigin?: string;
  }): Promise<EmbedConfig> {
    return {
      apiUrl: (this.baseUrl || requestOrigin || '').replace(/\/+$/, ''),
      apiKey: this.resolveApiKey(issuerType, type),
      allowedOrigins: await this.allowedOriginsService.getAllowedOrigins(),
      protocolVersion: EMBED_PROTOCOL_VERSION,
    };
  }

  /**
   * Same rules as the standalone app: GM bookings use the CA key, GM proposals the BE key.
   */
  protected resolveApiKey(issuerType: OidcIssuerTypes, type: EmbedFlowType): string {
    switch (issuerType) {
      case OidcIssuerTypes.GO:
        return this.goApiKey;
      case OidcIssuerTypes.PARTNERS:
        return this.partnersApiKey;
      default:
        return type === EmbedFlowType.BOOKING ? this.gmApiKeyCa : this.gmApiKeyBe;
    }
  }
}
