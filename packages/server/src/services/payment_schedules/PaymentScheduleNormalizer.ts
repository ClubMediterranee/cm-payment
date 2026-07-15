import { Service } from '@tsed/di';

import {
  CartModel,
  CartUpgradeRoomModel,
  ProposalPaymentScheduleModelV1,
} from '../../infra/api/__generated__/index.js';
import { ApiResponse, PaymentSchedule } from './types.js';

@Service()
export class PaymentScheduleNormalizer {
  normalize(response: ApiResponse) {
    if (this.isCart(response)) {
      const price = response.price;
      const amount = price && 'amount' in price ? price.amount : price?.total;

      return this.normalizeCartSchedule({ amount, currency: price?.currency });
    }

    if (this.isProposalSchedule(response)) {
      return this.normalizeProposalSchedule(response);
    }

    return response as PaymentSchedule;
  }

  private isCart(data: any): data is CartModel | CartUpgradeRoomModel {
    return !!data?.price;
  }

  private isProposalSchedule(data: any): data is ProposalPaymentScheduleModelV1 {
    return Array.isArray(data?.households);
  }

  private normalizeCartSchedule({ amount, currency }: { amount?: number; currency?: string }) {
    return {
      currency: currency || '',
      total: amount,
      payment_schedules: [{ amount }],
    };
  }

  private normalizeProposalSchedule(data: ProposalPaymentScheduleModelV1) {
    const household = data.households?.[0];

    return {
      currency: data.currency || 'EUR',
      total: household?.total,
      payment_schedules: (household?.deposit_repayment_schedule || []).map((item) => ({
        amount: item.expected_payment_amount,
        deadline: item.deadline || undefined,
      })),
    };
  }
}
