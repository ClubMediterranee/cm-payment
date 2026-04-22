import { Service } from '@tsed/di';

import { PaymentSchedule, PaymentScheduleOutput } from './types.js';

@Service()
export class PaymentScheduleBuilder {
  build(data: PaymentSchedule): PaymentScheduleOutput[] {
    const currency = data.currency || '';
    const payments = data.payment_schedules || [];

    if (payments.length === 0) {
      return [];
    }

    if (payments.length === 1) {
      return this.buildSinglePayment(payments[0], currency);
    }

    return this.buildMultiplePayments(payments, data.total, currency);
  }

  private buildSinglePayment(
    payment: { amount?: number; deadline?: string },
    currency: string,
  ): PaymentScheduleOutput[] {
    if (payment.amount === undefined) {
      return [];
    }

    return [
      {
        amount: payment.amount,
        deadline: payment.deadline,
        currency,
      },
    ];
  }

  private buildMultiplePayments(
    payments: Array<{ amount?: number; deadline?: string }>,
    total: number | undefined,
    currency: string,
  ): PaymentScheduleOutput[] {
    const result: PaymentScheduleOutput[] = [
      {
        amount: total,
        currency,
      },
    ];

    if (payments[0]?.amount !== undefined) {
      result.push({
        amount: payments[0].amount,
        currency,
        deadline: payments[1]?.deadline,
        balance: payments[1]?.amount,
      });
    }

    return result;
  }
}
