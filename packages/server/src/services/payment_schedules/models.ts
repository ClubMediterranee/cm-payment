import { Property } from '@tsed/schema';

export class PaymentScheduleOutputModel {
  @Property()
  amount?: number;

  @Property()
  currency?: string;

  @Property()
  deadline?: string;

  @Property()
  balance?: number;
}
