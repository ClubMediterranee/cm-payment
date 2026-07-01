import { AdditionalProperties, Property, Required } from '@tsed/schema';

export class PaymentlessBody {
  @Required()
  callback_url!: string;

  @Required()
  booking_id!: string;

  @Required()
  customer_id!: string;

  @Required()
  provider_id!: string;

  @Required()
  amount!: string;

  @Required()
  currency!: string;

  @Property()
  proposal_id?: string;
}

export class PaymentRedirectResultModel {
  @Required()
  url!: string;

  @Required()
  method!: string;
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
