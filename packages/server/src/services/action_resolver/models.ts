import { Enum, Required } from '@tsed/schema';

import { Action } from '../../infra/api/__generated__/index.js';

export class ResolvedActionModel {
  @Required()
  @Enum(Action)
  action!: Action;
}
