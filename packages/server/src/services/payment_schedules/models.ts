import { Property, Required } from '@tsed/schema';

export class PaymentScheduleOutputModel {
  @Property()
  amount?: number;

  @Required()
  currency!: string;

  @Property()
  deadline?: string;

  @Property()
  balance?: number;
}
