import { Controller, Inject } from '@tsed/di';
import { HeaderParams, QueryParams } from '@tsed/platform-params';
import { Enum, Get, Header, Required, Returns, Summary } from '@tsed/schema';

import { EmbedConfigService } from '../../../services/embed/EmbedConfigService.js';
import { EmbedConfig, EmbedFlowType } from '../../../services/embed/models.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';

@Controller('/embed')
export class EmbedConfigController {
  @Inject()
  protected embedConfigService!: EmbedConfigService;

  @Get('/config')
  @Summary('Runtime configuration of the embedded CAPS flow (webcomponent and iframe modes)')
  @Returns(200, EmbedConfig)
  @Header('Cache-Control', 'no-cache')
  @Returns(400)
  async getConfig(
    @Required() @Enum(OidcIssuerTypes) @QueryParams('issuer') issuerType: OidcIssuerTypes,
    @Required() @Enum(EmbedFlowType) @QueryParams('type') type: EmbedFlowType,
    @HeaderParams('x-forwarded-host') forwardedHost?: string,
    @HeaderParams('host') host?: string,
  ): Promise<EmbedConfig> {
    const requestHost = forwardedHost || host;

    return this.embedConfigService.getConfig({
      issuerType,
      type,
      requestOrigin: requestHost ? `https://${requestHost}` : undefined,
    });
  }
}
