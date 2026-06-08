import { Controller, Inject } from '@tsed/di';
import { PathParams, QueryParams } from '@tsed/platform-params';
import { Enum, Get, Returns, Summary } from '@tsed/schema';

import { IssuerType } from '../../../decorators/IssuerType.js';
import { Locale } from '../../../decorators/Locale.js';
import { Action } from '../../../infra/api/__generated__/index.schemas.js';
import { ActionResolverService } from '../../../services/action_resolver/ActionResolverService.js';
import { ResolvedActionModel } from '../../../services/action_resolver/models.js';
import { OidcIssuerTypes } from '../../../services/payment_config/types.js';

@Controller('/action_resolver')
export class ActionResolverController {
  @Inject()
  protected actionResolverService!: ActionResolverService;

  @Get('/:type/:id')
  @Summary('Resolve the payment action for a booking or proposal')
  @Returns(200, ResolvedActionModel)
  async resolveAction(
    @Enum('booking', 'proposal') @PathParams('type') type: 'booking' | 'proposal',
    @PathParams('id') id: string,
    @Locale() locale: string,
    @IssuerType() issuerType: OidcIssuerTypes,
    @QueryParams('customer_id') customerId?: string,
    @Enum(Action) @QueryParams('action') action?: Action,
  ): Promise<ResolvedActionModel> {
    const resolved = await this.actionResolverService.resolveAction({
      type,
      id,
      customerId,
      action,
      locale,
      issuerType,
    });
    return { action: resolved };
  }
}
