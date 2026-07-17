import { AdditionalProperties, Property, Required } from '@tsed/schema';

import type { BillingDetailsModel, HeadersModel } from '../../infra/api/__generated__/index.js';
import { Action } from '../../infra/api/__generated__/index.js';

export class PaymentRedirectRequestBody {
  @Required()
  type!: 'proposal' | 'booking';

  @Required()
  id!: string;

  @Property()
  customer_id?: string;

  @Required()
  provider_id!: string;

  @Property()
  connection_type?: string;

  @Required()
  action!: Action;

  @Required()
  amount!: string;

  @Required()
  currency!: string;

  @Property()
  payment_condition_id?: string;

  @Property()
  template_id?: string;

  @Property()
  billing_details?: BillingDetailsModel;

  @Property()
  donation_amount?: number;

  @Property()
  token?: string;

  @Required()
  callback_url!: string;

  @Property()
  callback_url_seller?: string;

  @Property()
  uuid?: string;

  @Property()
  reference?: string;
}

export class RedirectCallbacksModel {
  @Required()
  callback_url!: string;

  @Property()
  callback_url_seller?: string;
}

export class PaymentInfoModel {
  @Required()
  paymentId!: string;

  @Required()
  callbacks!: RedirectCallbacksModel;
}

export class ProviderRedirectModel {
  @Required()
  url!: string;

  @Required()
  method!: string;

  @Property()
  body?: string;

  @Property()
  headers?: HeadersModel;
}

export class PaymentRedirectRequestResult {
  @Required()
  redirect!: ProviderRedirectModel;

  @Property()
  payment?: PaymentInfoModel;
}

@AdditionalProperties(true)
export class PaymentRedirectQuery {
  @Required()
  callback_url!: string;

  @Property()
  proposal_id?: string;

  @Property()
  provider_id?: string;

  @Property()
  locale?: string;

  @Property()
  mode?: string;

  [key: string]: any;
}
