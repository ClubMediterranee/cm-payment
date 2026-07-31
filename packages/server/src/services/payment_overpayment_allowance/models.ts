import { Property, Required } from '@tsed/schema';

export class OverpaymentAllowanceOutputModel {
  @Required()
  @Property(Number)
  amount!: number;
}
